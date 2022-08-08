import React, { useContext, useEffect, useRef, useState } from "react"
import { Box, BoxProps } from '@chakra-ui/react';
import { EditorContext } from '../Editor';
import { barWidth, getFuncMoveToTime, setBar } from "../EditorUtils"
import { EditorMainBarContext } from './EditorMainBar';
import { ReactMouseEvent } from 'src/types/reactUtils';

export default function EditorStartBar(props: BoxProps) {
    const [startDragging, setDragging] = useState(false)
    const { selection, duration, setSelection } = useContext(EditorContext)
    const { mainBarRef, onEndMouseDrag, resize } = useContext(EditorMainBarContext)
    const startRef = useRef(null)

    const startDrag = () => {
        console.log("Start dragging")
        document.body.style.userSelect = "none"
        setDragging(true)
    }

    useEffect(() => {
        const { offset, range, start } = selection

        setBar({
            currTime: start,
            mainBarRef,
            offset,
            range,
            ref: startRef
        })
    }, [selection, resize])

    useEffect(() => {
        const stopDragging = () => {
            setDragging(false)
            onEndMouseDrag()
        }


        document.addEventListener("mouseup", stopDragging)
        return () => {
            document.removeEventListener("mouseup", stopDragging)
        }
    }, [])


    useEffect(() => {
        const { offset, range, end } = selection
        if (!mainBarRef.current)
            return

        const onMoveToTime = getFuncMoveToTime({
            duration,
            mainBarRef
        })

        const onMouseMove = (e: ReactMouseEvent) => {
            if (!mainBarRef?.current)
                return

            const time = onMoveToTime(e, range, offset)

            if (!(startDragging && time !== null && time < end))
                return

            setSelection({
                ...selection,
                start: time
            })
        }
        mainBarRef.current.addEventListener("mousemove", onMouseMove)
        return () => {
            mainBarRef?.current?.removeEventListener("mousemove", onMouseMove)
        }
    }, [startDragging, selection, mainBarRef, duration])

    return <Box
        {...props}
        gridRow='1'
        gridColumn='1'
        ref={startRef}
        w={`${barWidth}px`}
        onMouseDown={() => startDrag()}
    />
}