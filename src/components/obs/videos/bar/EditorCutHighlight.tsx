import { Box, BoxProps } from '@chakra-ui/react';
import React, { useContext, useEffect, useRef } from "react";
import { EditorContext } from '../Editor';
import { EditorMainBarContext } from './EditorMainBar';

export default function EditorCutHighlight(props: BoxProps) {
    const { selection, duration } = useContext(EditorContext)
    const { mainBarRef, resize } = useContext(EditorMainBarContext)

    const highlight = useRef<HTMLDivElement>()
    useEffect(() => {
        const { start, end, range, offset } = selection
        if (!highlight.current || !mainBarRef.current || duration === undefined)
            return

        const width = mainBarRef.current.clientWidth
        let startPixel = Math.max(0, (start - offset) / range * width)
        let endPixel = Math.min(width, (end - offset) / range * width)

        highlight.current.style.transform = `translateX(${startPixel}px)`
        highlight.current.style.width = `${endPixel - startPixel}px`
    }, [selection, highlight, mainBarRef, duration, resize])

    return <Box
        {...props}
        gridRow='1'
        gridColumn='1'
        ref={highlight}
    >

    </Box>
}