import { clamp } from '@backend/tools/math'
import { Box, Button, Flex, Grid, Text } from '@chakra-ui/react'
import prettyMS from "pretty-ms"
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { BsFillCaretLeftFill } from "react-icons/bs"

export default function Editor({ clipName, onBack }: { clipName: string, onBack: () => void }) {
    const barWidth = 5
    const getEndStartBuffer = (_offset: number, range: number) => Math.max(range * 0.1, 2)

    const videoRef = useRef<HTMLVideoElement>()
    const seekBar = useRef<HTMLDivElement>()
    const startBar = useRef<HTMLDivElement>()
    const endBar = useRef<HTMLDivElement>()
    const outerBar = useRef<HTMLDivElement>()

    const [seekDragging, setSeekDragging] = useState(false)
    const [startDragging, setStartDragging] = useState(false)
    const [endDragging, setEndDragging] = useState(false)

    const [update, setUpdate] = useState(0)
    const [duration, setDuration] = useState<number | null>(null)
    const [paused, setPaused] = useState(true)
    const [currRange, setRange] = useState<number | null>(null)
    const [currOffset, setOffset] = useState<number>(0)
    const [selectStart, setSelectStart] = useState<number>(0)
    const [selectEnd, setSelectEnd] = useState<number | null>(null)
    const [canvasBackgrounds, setCanvasBackgrounds] = useState(new Map<number, string>())

    const [isGenerating, setGenerating] = useState(false)


    const startSeekDrag = () => {
        document.body.style.userSelect = "none"
        setSeekDragging(true)
    }

    const startDrag = (type: "start" | "end") => {
        document.body.style.userSelect = "none"
        if (type === "start")
            setStartDragging(true)
        else
            setEndDragging(true)
    }

    const isInTimeFrame = (time: number) => {
        if (!currRange || currOffset === null)
            return false

        return time >= currOffset && time <= currRange + currOffset
    }


    const updateElements = () => {
        if (!seekBar?.current || !endBar?.current || !startBar?.current || !videoRef?.current || !outerBar?.current)
            return

        const seek = seekBar.current
        const start = startBar.current
        const end = endBar.current

        const width = outerBar.current.clientWidth - barWidth

        const setBar = (currTime: number, ref: HTMLDivElement) => {
            const percentage = (currTime - currOffset) / currRange

            const position = percentage * width
            const currDisplay = isInTimeFrame(currTime) ? "block" : "none"
            ref.setAttribute("style", `display: ${currDisplay};transform: translateX(${position}px)`)
        }

        setBar(videoRef.current.currentTime, seek)
        setBar(selectEnd, end)
        setBar(selectStart, start)
        const generateBg = () => {

            const currRangePercentage = currRange / duration
            const segments = 10 + 20 * (1 - currRangePercentage)
            const colors = ["#3B4863", "#5A6E96"]
            // Grid Background
            const stepPercentage = 1 / segments

            const size = [outerBar.current.clientWidth, outerBar.current.clientHeight]
            let canvas = document.createElement("canvas")
            canvas = document.body.appendChild(canvas)

            canvas.width = size[0]
            canvas.height = size[1]
            const ctx = canvas.getContext("2d")

            for (let i = 0; i < segments; i++) {
                const color = colors[i % 2]
                const percentage = stepPercentage * i

                const startX = percentage * size[0]
                const endX = stepPercentage * (i + 1) * size[0]

                console.log("Start", startX, "width", endX - startX, "color", color, size[0])
                ctx.fillStyle = color
                ctx.fillRect(startX, 0, endX - startX, size[1])
            }

            const data = canvas.toDataURL()
            canvas.remove()

            setCanvasBackgrounds(canvasBackgrounds.set(currRange, data))
            console.log(data)
            return data
        }


        const bg = canvasBackgrounds.get(currRange) ?? generateBg()
        outerBar.current.style.background = `url(${bg})`
    }

    useEffect(() => {
        updateElements()
    }, [update])

    useEffect(() => {
        if (!videoRef?.current)
            return

        videoRef.current.onloadeddata = () => {
            const duration = videoRef.current.duration
            setDuration(duration)
            setRange(duration)
            setSelectEnd(duration)
        }
    }, [videoRef])

    const onMoveToTime = (e: React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent) => {
        if (!outerBar?.current || !videoRef?.current)
            return null

        let rect = outerBar.current.getBoundingClientRect();

        let x = e.clientX - rect.left;
        const full = outerBar.current.clientWidth

        const percentage = clamp(x / full, 0, 1)
        const calculatedTime = currRange * percentage + currOffset

        // Snap to start and end if shift is not pressed

        const isAtEnd = currOffset + currRange >= duration
        const isAtStart = Math.floor(currOffset * 100) === 0

        const endTwoPixelTime = (full - 2) / full * currRange + currOffset
        const startTwoPixelTime = 2 / full * currRange + currOffset

        if (calculatedTime <= startTwoPixelTime && isAtStart && !e.shiftKey && e.movementX < 0)
            return 0

        if (calculatedTime >= endTwoPixelTime && isAtEnd && !e.shiftKey && e.movementX > 0)
            return duration

        return calculatedTime
    }

    const processMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent) => {
        if (!videoRef?.current || !outerBar?.current)
            return

        const time = onMoveToTime(e)
        if (seekDragging && time !== null)
            videoRef.current.currentTime = time

        if (startDragging && time !== null && time < selectEnd)
            setSelectStart(time)

        if (endDragging && time !== null && time > selectStart)
            setSelectEnd(time)

        updateElements()
    }

    const playClip = () => {
        if (!videoRef?.current)
            return

        const video = videoRef.current
        function checkTime() {
            if (video.currentTime >= selectEnd) {
                video.pause();
                return setPaused(video.paused)
            }

            setTimeout(checkTime, selectEnd - video.currentTime);
        }

        video.currentTime = selectStart
        video.play()
        setPaused(false)
        checkTime()
    }

    useEffect(() => {
        console.log("Effect", outerBar, "End", endBar)
        if (!outerBar?.current || !endBar?.current)
            return

        const clientWidth = outerBar.current.clientWidth
        endBar.current.setAttribute("style", `transform: translateX(${clientWidth}px)`)
    }, [outerBar, endBar])

    useEffect(() => {
        const intervalId = setInterval(() => setUpdate(Math.random()), 40)


        const endMouseDrag = () => {
            document.body.style.userSelect = ""
            setSeekDragging(false)
            setStartDragging(false)
            setEndDragging(false)
            const endStartBuffer = getEndStartBuffer(currOffset, currRange)

            const newOffset = Math.max(selectStart - endStartBuffer, 0)
            const diff = Math.min(selectEnd - newOffset + endStartBuffer, duration - newOffset)


            console.log("NewOffset", newOffset, "Range", diff)
            if (currOffset !== newOffset || currRange !== diff) {
                setOffset(newOffset)
                setRange(diff)
            }
        }

        document.addEventListener("mouseup", endMouseDrag)
        return () => {
            clearInterval(intervalId)
            document.removeEventListener("mouseup", endMouseDrag)
        };
    }, [currRange, selectStart, selectEnd, duration, currOffset])

    const togglePlay = useCallback(() => {
        if (!videoRef?.current)
            return
        videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause()
        setPaused(videoRef.current.paused)
    }, [paused])


    const generateClip = () => {
        if (isGenerating)
            return

        setGenerating(true)
        window.api.clips.cut(clipName, selectStart, selectEnd)
            .then(e => setGenerating(false))
    }

    return <>
        <Box w='100%'>
            <Button
                aria-label='Back'
                leftIcon={<BsFillCaretLeftFill />}
                onClick={onBack}
            >Back</Button>
        </Box>

        <Flex h='40em' rounded='xl' overflow='hidden' mb='6'>
            <video ref={videoRef}>
                <source src={`clip-video-file:///${encodeURIComponent(clipName)}`}></source>
            </video>
        </Flex>
        <Flex
            w='100%'
            justifyContent='space-around'
            alignItems='center'
        >
            <Button onClick={togglePlay}>{paused ? "Play" : "Pause"}</Button>
            <Button onClick={generateClip} isLoading={isGenerating} loadingText='Generating clip...'>Generate Clip</Button>
            <Button onClick={() => {
                setOffset(0);
                setRange(duration);
                setSelectStart(0);
                setSelectEnd(duration);
                updateElements()
            }}>Reset Selection</Button>
            <Button onClick={playClip}>Play Clip</Button>
            <Text>{duration ? prettyMS(duration * 1000) : "Loading..."}</Text>
        </Flex>
        <Grid
            w='80%'
            h='10em'
            bg='gray'
            ref={outerBar}
            onMouseMove={e => processMouseMove(e)}
            onContextMenu={e => e.button === 2 && processMouseMove(e)}
            onMouseDown={e => e.button === 2 && startSeekDrag()}
        >
            <Box
                gridRow='1'
                gridColumn='1'
                h='100%'
                w='3px'
                bg='red'
                ref={seekBar}
                cursor='pointer'
                onMouseDown={() => startSeekDrag()}
                zIndex='2'
            />
            <Box
                gridRow='1'
                gridColumn='1'
                h='100%'
                w={`${barWidth}px`}
                bg='blue'
                ref={startBar}
                cursor='pointer'
                onMouseDown={() => startDrag("start")}
            />
            <Box
                gridRow='1'
                gridColumn='1'
                h='100%'
                w={`${barWidth}px`}
                bg='blue'
                ref={endBar}
                cursor='pointer'
                onMouseDown={() => startDrag("end")}
            />
        </Grid>
        <Flex w='80%'>
            <Text alignSelf='start' whiteSpace='nowrap'>{prettyMS(selectStart * 1000)}</Text>
            <Box w='100%' />
            <Text alignSelf='end' whiteSpace='nowrap'>{selectEnd === null ? "Loading..." : prettyMS(selectEnd * 1000)}</Text>
        </Flex>
    </>
}