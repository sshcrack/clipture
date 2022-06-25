import { Grid } from '@chakra-ui/react';
import { GridProps } from '@chakra-ui/styled-system';
import React, { useEffect, useRef, useState } from "react"
import { useContext } from 'react';
import { ReactSetState } from 'src/types/reactUtils';
import { EditorContext } from '../Editor';


export type EditorMainBarState = {
    mainBarRef: React.MutableRefObject<HTMLDivElement>,
    seekDragging: boolean,
    setSeekDragging: ReactSetState<boolean>,
    onEndMouseDrag: () => void
}

export const EditorMainBarContext = React.createContext<EditorMainBarState>({
    mainBarRef: null,
    seekDragging: false,
    setSeekDragging: () => { },
    onEndMouseDrag: () => { }
})

export default function EditorMainBar(props: React.PropsWithChildren<GridProps>) {
    const getEndStartBuffer = (_offset: number, range: number) => Math.max(range * 0.1, 2)

    const { videoRef, selection, duration, setSelection, bgGeneratorRef: bgGenerator } = useContext(EditorContext)
    const { range, offset, start, end } = selection

    const [seekDragging, setSeekDragging] = useState(false)
    const [canvasBackgrounds, setCanvasBackgrounds] = useState(new Map<string, string>())
    const mainBarRef = useRef<HTMLDivElement>(null)

    const startSeekDrag = () => {
        document.body.style.userSelect = "none"
        setSeekDragging(true)
    }

    useEffect(() => {
        if (!bgGenerator?.current || !videoRef?.current)
            return

        const bgCurr = bgGenerator.current
        const videoCurr = videoRef.current
        const mainBarCurr = mainBarRef.current
        const mainHeight = mainBarCurr.clientHeight
        const mainWidth = mainBarCurr.clientWidth

        //? *****************************************
        //?           RENDERING BACKGROUND
        //? *****************************************

        const { range } = selection
        const colors = ["#3B4863", "#5A6E96"]
        const aspectRatio = videoCurr.videoHeight / videoCurr.videoWidth
        const segments = Math.ceil(aspectRatio * mainWidth / mainHeight)

        console.log("Segments are", segments)
        const id = `${range}-${offset}`

        const generateBg = async () => {
            // Grid Background
            const stepPercentage = 1 / segments

            const size = [mainWidth, mainHeight]
            let canvas = document.createElement("canvas")

            canvas.width = size[0]
            canvas.height = size[1]
            const ctx = canvas.getContext("2d")

            for (let i = 0; i < segments; i++) {
                const color = colors[i % 2]
                const percentage = stepPercentage * i
                const currFrameTime = percentage * duration + offset
                await new Promise<void>(resolve => {
                    let seeked = false
                    let nextAnimFrame = false

                    const isSeekedEvent = () => {
                        if (nextAnimFrame)
                            resolve()
                        seeked = true
                        bgCurr.removeEventListener("seeked", isSeekedEvent)
                    }
                    bgCurr.addEventListener("seeked", isSeekedEvent)
                    bgCurr.currentTime = currFrameTime
                    console.log(currFrameTime)
                    requestAnimationFrame(() => {
                        if (seeked)
                            resolve()
                        nextAnimFrame = true
                    })
                });

                const startX = percentage * size[0]
                const rectEndX = stepPercentage * (i + 1) * size[0]
                const imgWidth = stepPercentage * mainWidth

                ctx.fillStyle = color
                ctx.fillRect(startX, 0, rectEndX - startX, size[1])
                ctx.drawImage(bgCurr, startX, 0, imgWidth, mainHeight)
            }

            const data = canvas.toDataURL()
            canvas.remove()

            setCanvasBackgrounds(canvasBackgrounds.set(id, data))
            return data
        }

        const bg = canvasBackgrounds.has(id) ? Promise.resolve(canvasBackgrounds.get(id)) : generateBg()
        bg.then(res => mainBarRef.current.style.backgroundImage = `url(${res})`)

    }, [selection, videoRef, bgGenerator])


    const endMouseDrag = () => {
        const endStartBuffer = getEndStartBuffer(offset, range)

        const newOffset = Math.max(start - endStartBuffer, 0)
        const diff = Math.min(end - newOffset + endStartBuffer, duration - newOffset)

        if ((offset !== newOffset || range !== diff) && !isNaN(newOffset) && !isNaN(diff)) {
            setSelection({
                ...selection,
                offset: newOffset,
                range: diff
            })
        }
    }

    return <EditorMainBarContext.Provider
        value={{
            mainBarRef,
            seekDragging,
            setSeekDragging,
            onEndMouseDrag: endMouseDrag
        }}
    >
        <Grid
            w='80%'
            h='10em'
            backgroundRepeat='repeat'
            bg='gray'
            {...props}
            ref={mainBarRef}
            onMouseDown={e => {
                if (e.button === 2)
                    startSeekDrag()
            }}
        >
            {props.children}
        </Grid>
    </EditorMainBarContext.Provider>
}