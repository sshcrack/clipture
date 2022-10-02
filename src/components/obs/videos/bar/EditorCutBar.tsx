import { Box, BoxProps } from '@chakra-ui/react'
import React, { useContext, useEffect, useRef, useState } from "react"
import { ReactMouseEvent } from 'src/types/reactUtils'
import { EditorContext } from '../Editor'
import { barWidth, getFuncMoveToTime, setBar } from '../EditorUtils'
import { EditorMainBarContext } from './EditorMainBar'

export default function EditorCutBar({ type, ...props }: BoxProps & { type: "start" | "end" }) {
    const [dragging, setDragging] = useState(false)
    const { selection, duration, setSelection } = useContext(EditorContext)
    const { mainBarRef, onEndMouseDrag, resize } = useContext(EditorMainBarContext)
    const boxRef = useRef(null)

    const startDrag = () => {
        document.body.style.userSelect = "none"
        setDragging(true)
    }


    useEffect(() => {
        const { offset, range } = selection
        if (!duration)
            return
        setBar({
            currTime: selection[type],
            mainBarRef,
            offset,
            range,
            ref: boxRef
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
        const { range, offset, start, end } = selection
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
            if (type === "start" && !(dragging && time !== null && time < end))
                return
            if (type === "end" && !(dragging && time !== null && time > start))
                    return

            setSelection({
                ...selection,
                [type]: time
            })
        }

        mainBarRef.current.addEventListener("mousemove", onMouseMove)
        return () => {
            mainBarRef?.current?.removeEventListener("mousemove", onMouseMove)
        }
    }, [dragging, selection, mainBarRef])

    return <Box
        {...props}
        gridRow='1'
        zIndex='100'
        gridColumn='1'
        ref={boxRef}
        borderRadius='5px'
        w={`${barWidth}px`}
        onMouseDown={() => startDrag()}
    />
}