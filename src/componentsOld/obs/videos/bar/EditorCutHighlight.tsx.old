import { Box, BoxProps } from '@chakra-ui/react';
import React, { useContext, useEffect, useRef } from "react";
import { EditorContext } from '../Editor';
import { EditorMainBarContext } from './EditorMainBar';

export default function EditorCutHighlight(props: BoxProps) {
    const { selection, duration } = useContext(EditorContext)
    const { mainBarRef, resize, bgImageRef } = useContext(EditorMainBarContext)
    const highlightRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const { start, end, range, offset } = selection
        if (!highlightRef.current || !mainBarRef.current || duration === undefined || !bgImageRef.current)
            return

        const width = mainBarRef.current.clientWidth
        const percentageStart = (start - offset) / range
        const percentageEnd = (end - offset) / range

        const cssStart = percentageStart * 100;
        const cssEnd = percentageEnd * 100

        const startPixel = Math.max(0, percentageStart * width)
        const endPixel = Math.min(width, percentageEnd * width)


        const unselectedColor = "rgba(255, 255, 255, 0.25)"


        highlightRef.current.style.transform = `translateX(${startPixel}px)`
        highlightRef.current.style.width = `${endPixel - startPixel}px`

        bgImageRef.current.style.webkitMaskImage = `linear-gradient(90deg, ${unselectedColor} 0%, ${unselectedColor} ${cssStart}%, #000 ${cssStart}%, #000 ${cssEnd}%, ${unselectedColor} ${cssEnd}%, ${unselectedColor} 100%)`
    }, [selection, mainBarRef, duration, resize, bgImageRef])

    return <Box
        {...props}
        gridRow='1'
        gridColumn='1'
        ref={highlightRef}
    />
}