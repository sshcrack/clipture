import React, { useEffect , useContext, useRef } from 'react';
import { Box, BoxProps } from '@chakra-ui/react';

import { EditorContext } from '../Editor';
import { EditorMainBarContext } from './EditorMainBar';
import { ReactMouseEvent } from 'src/types/reactUtils';
import { getFuncMoveToTime, setBar } from '../EditorUtils';

export default function EditorSeekBar(props: BoxProps) {
    const { videoRef, selection, duration } = useContext(EditorContext)
    const { mainBarRef, seekDragging, setSeekDragging: setDragging, onEndMouseDrag } = useContext(EditorMainBarContext)
    const seekBar = useRef<HTMLDivElement>()


    const startSeekDrag = () => {
        document.body.style.userSelect = "none"
        setDragging(true)
    }



    useEffect(() => {
        const { offset, range } = selection
        if (!duration || !videoRef.current)
            return


        const updateBar = () => {
            setBar({
                currTime: videoRef.current.currentTime,
                mainBarRef,
                offset,
                range,
                ref: seekBar
            })
        }


        const intervalId = setInterval(() => updateBar(), 10)
        return () => {
            clearInterval(intervalId)
        }
    }, [duration, videoRef, selection])



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
        const { offset, range } = selection
        if (!mainBarRef.current)
            return


        const onMoveToTime = getFuncMoveToTime({
            duration,
            mainBarRef
        })

        const onMouseMove = (e: ReactMouseEvent) => {
            const time = onMoveToTime(e, range, offset)

            if (seekDragging && time !== null) {
                videoRef.current.currentTime = time
            }
        }

        mainBarRef.current.addEventListener("mousemove", onMouseMove)
        return () => {
            mainBarRef?.current?.removeEventListener("mousemove", onMouseMove)
        }
    }, [mainBarRef, selection, videoRef, seekDragging])

    return <Box
        h='100%'
        w='5px'
        borderRadius='5px'
        bg='red'
        {...props}
        gridRow='1'
        gridColumn='1'
        ref={seekBar}
        cursor='pointer'
        onMouseDown={() => startSeekDrag()}
        zIndex='100'
    />
}