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
    onEndMouseDrag: () => {}
})

export default function EditorMainBar(props: React.PropsWithChildren<GridProps>) {
    const getEndStartBuffer = (_offset: number, range: number) => Math.max(range * 0.1, 2)

    const { videoRef, selection, duration, setSelection } = useContext(EditorContext)
    const { range, offset, start, end } = selection

    const [seekDragging, setSeekDragging] = useState(false)
    const [canvasBackgrounds, setCanvasBackgrounds] = useState(new Map<number, string>())
    const mainBarRef = useRef<HTMLDivElement>(null)

    const startSeekDrag = () => {
        document.body.style.userSelect = "none"
        setSeekDragging(true)
    }

    useEffect(() => {
        //? *****************************************
        //?           RENDERING BACKGROUND
        //? *****************************************

        const { range } = selection
        const currRangePercentage = range / duration
        const colors = ["#3B4863", "#5A6E96"]
        const additionalSegments = Math.round(20 * currRangePercentage)
        const segments = 10 + additionalSegments + additionalSegments % colors.length

        const generateBg = () => {
            // Grid Background
            const stepPercentage = 1 / segments

            const size = [mainBarRef.current.clientWidth, mainBarRef.current.clientHeight]
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

                ctx.fillStyle = color
                ctx.fillRect(startX, 0, endX - startX, size[1])
            }

            const data = canvas.toDataURL()
            canvas.remove()

            setCanvasBackgrounds(canvasBackgrounds.set(range, data))
            return data
        }

        const bg = canvasBackgrounds.get(range) ?? generateBg()
        mainBarRef.current.style.backgroundImage = `url(${bg})`

    }, [selection, videoRef])


    const endMouseDrag = () => {        const endStartBuffer = getEndStartBuffer(offset, range)

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
            onMouseUp={() => {

                setSeekDragging(false)

            }}
            onMouseDown={e => {
                if (e.button === 2)
                    startSeekDrag()
            }}
        >
            {props.children}
        </Grid>
    </EditorMainBarContext.Provider>
}