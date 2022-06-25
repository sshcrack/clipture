import React, { useContext, useEffect, useRef, useState } from "react"
import { Box, BoxProps } from '@chakra-ui/react';
import { EditorContext } from '../Editor';
import { barWidth, getFuncMoveToTime, setBar } from "../EditorUtils"
import { EditorMainBarContext } from './EditorMainBar';
import { ReactMouseEvent } from 'src/types/reactUtils';

export default function EditorEndBar(props: BoxProps) {
    const [endDragging, setEndDragging] = useState(false)
    const { selection, duration, setSelection } = useContext(EditorContext)
    const { mainBarRef, onEndMouseDrag } = useContext(EditorMainBarContext)
    const endRef = useRef(null)

    const startDrag = () => {
        document.body.style.userSelect = "none"
        setEndDragging(true)
    }


    useEffect(() => {
        const { offset, range, end } = selection
        if (!duration)
            return
        setBar({
            currTime: end,
            mainBarRef,
            offset,
            range,
            ref: endRef
        })
    }, [selection])


    useEffect(() => {
        const { start, range, offset } = selection
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
            if (!(endDragging && time !== null && time > start))
                return

            setSelection({
                ...selection,
                end: time
            })
        }

        const endMouseDragging = () => {
            setEndDragging(false)
            onEndMouseDrag()
        }

        document.addEventListener("mouseup", endMouseDragging)
        mainBarRef.current.addEventListener("mousemove", onMouseMove)
        return () => {
            document.removeEventListener("mouseup", endMouseDragging)
            mainBarRef?.current?.removeEventListener("mousemove", onMouseMove)
        }
    }, [endDragging, selection, mainBarRef])

    return <Box
        {...props}
        gridRow='1'
        gridColumn='1'
        ref={endRef}
        w={`${barWidth}px`}
        onMouseDown={() => startDrag()}
    />
}