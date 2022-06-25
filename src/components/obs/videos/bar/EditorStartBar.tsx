import React, { useContext, useEffect, useRef, useState } from "react"
import { Box, BoxProps } from '@chakra-ui/react';
import { EditorContext } from '../Editor';
import { barWidth, getFuncMoveToTime, setBar } from "../EditorUtils"
import { EditorMainBarContext } from './EditorMainBar';
import { ReactMouseEvent } from 'src/types/reactUtils';

export default function EditorStartBar(props: BoxProps) {
    const [startDragging, setStartDragging] = useState(false)
    const { selection, duration, setSelection } = useContext(EditorContext)
    const { mainBarRef, onEndMouseDrag } = useContext(EditorMainBarContext)
    const startRef = useRef(null)

    const startDrag = () => {
        document.body.style.userSelect = "none"
        setStartDragging(true)
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
    }, [selection])


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
        const stopDragging = () => {
            setStartDragging(false)
            onEndMouseDrag()
        }

        document.addEventListener("mouseup", stopDragging)
        mainBarRef.current.addEventListener("mousemove", onMouseMove)
        return () => {
            document.removeEventListener("mouseup", stopDragging)
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