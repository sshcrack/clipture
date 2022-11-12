import { Flex } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from "react";

export type LikeShortcutProps = {
    like: (liked: boolean) => unknown,
    liked: boolean
}

function randomBetween(min: number, max: number) {
    const diff = max - min
    return Math.random() * diff + min
}

type HeartInfo = {
    x: number,
    y: number,
    velocity: {
        x: number,
        y: number
    },
    size: number
}

export default function LikeShortcut({ like, liked }: LikeShortcutProps) {
    const canvasRef = useRef<HTMLCanvasElement>()
    const [animationRunning, setAnimationRunning] = useState(false)

    const drawLikeAnimation = () => {
        const heartPath = new Path2D("M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z")

        const curr = canvasRef?.current
        if (!curr || animationRunning)
            return


        setAnimationRunning(true)
        const ctx = curr.getContext("2d")

        const getRandomHearts = () => {
            const width = curr.width
            const heartAmount = 400
            const hearts = [] as HeartInfo[]
            for (let i = 0; i < heartAmount; i++) {
                const minSize = 1
                const maxSize = 5

                const minVelocityY = 5
                const maxVelocityY = 7

                const minVelocityX = 0.1
                const maxVelocityX = 2

                const minY = curr.height
                const maxY = curr.height + 400

                const randW = Math.random() * width
                const velY = randomBetween(minVelocityY, maxVelocityY)
                const velX = randomBetween(minVelocityX, maxVelocityX)
                const size = randomBetween(minSize, maxSize)


                hearts.push({
                    size: Math.floor(size),
                    velocity: {
                        y: velY,
                        x: velX
                    },
                    x: randW,
                    y: randomBetween(minY, maxY)
                })
            }

            return hearts
        }

        let hearts = getRandomHearts()

        const filterNonVisible = () => hearts = hearts.filter(e => e.y > 0)

        let lastRender = Date.now()
        const draw = () => {

            ctx.clearRect(0, 0, curr.width, curr.height);
            if (hearts.length === 0)
                return setAnimationRunning(false)

            filterNonVisible()
            const diff = Date.now() - lastRender
            for (let i = 0; i < hearts.length; i++) {
                const e = hearts[i]

                ctx.save()

                ctx.scale(e.size, e.size)
                ctx.translate(Math.floor(e.x), Math.floor(e.y))

                ctx.fillStyle = 'red'
                ctx.fill(heartPath)
                ctx.restore()


                e.x -= e.velocity.x * diff * 0.075
                e.y -= e.velocity.y * diff * 0.075

                hearts[i] = e
            }


            lastRender = Date.now()
            requestAnimationFrame(draw)
        }

        requestAnimationFrame(draw)
    }


    useEffect(() => {
        const listener = ({ key }: KeyboardEvent) => {
            if (key === "w") {
                if (!animationRunning && !liked)
                    drawLikeAnimation()

                like(!liked)
            }
        }

        const resizeEvent = () => {
            const curr = canvasRef?.current
            if (!curr)
                return

            curr.width = curr.parentElement.clientWidth
            curr.height = curr.parentElement.clientHeight
        }

        const curr = canvasRef?.current
        if (curr) {
            curr.width = curr.parentElement.clientWidth
            curr.height = curr.parentElement.clientHeight
        }

        window.addEventListener("keyup", listener)
        window.addEventListener("resize", resizeEvent)
        return () => {
            window.removeEventListener("keyup", listener)
            window.removeEventListener("resize", resizeEvent)
        }
    }, [liked, canvasRef, animationRunning])
    return <Flex w='100%' h='100%' position='absolute' top='0' left='0' pointerEvents='none' zIndex='100'
    >
        <canvas style={{
            width: '100%',
            height: '100%'
        }} ref={canvasRef}>

        </canvas>
    </Flex>
}