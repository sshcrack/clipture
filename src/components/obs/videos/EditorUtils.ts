import { clamp } from '@backend/tools/math';
import { UseNumberInputReturn } from '@chakra-ui/react';
import React from 'react';
import { ReactMouseEvent } from '../../../types/reactUtils';

export const barWidth = 5
export type FuncMoveTimeProps = {
    mainBarRef: React.MutableRefObject<HTMLDivElement>,
    duration: number
}
export function getFuncMoveToTime({ duration, mainBarRef }: FuncMoveTimeProps) {
    return (e: ReactMouseEvent, range: number, offset: number) => {
        if (!mainBarRef?.current)
            return null

        let rect = mainBarRef.current.getBoundingClientRect();

        let x = e.clientX - rect.left;
        const full = mainBarRef.current.clientWidth

        const percentage = clamp(x / full, 0, 1)
        const calculatedTime = range * percentage + offset

        // Snap to start and end if shift is not pressed

        const isAtEnd = offset + range >= duration
        const isAtStart = Math.floor(offset * 100) === 0

        const endTwoPixelTime = (full - 2) / full * range + offset
        const startTwoPixelTime = 2 / full * range + offset

        if (calculatedTime <= startTwoPixelTime && isAtStart && !e.shiftKey && e.movementX < 0)
            return 0

        if (calculatedTime >= endTwoPixelTime && isAtEnd && !e.shiftKey && e.movementX > 0)
            return duration

        return calculatedTime
    }
}

export type SetBarProps = {
    currTime: number,
    offset: number,
    range: number,
    ref: React.MutableRefObject<HTMLDivElement>,
    mainBarRef: React.MutableRefObject<HTMLDivElement>
}


export function isInTimeFrame(time: number, offset: number, range: number) {
    if (!range || offset === null)
        return false

    return time >= offset && time <= range + offset
}

export function setBar({
    currTime,
    mainBarRef,
    ref,
    offset,
    range
}: SetBarProps) {
    const clientBarWidth = mainBarRef.current.clientWidth
    const width = clientBarWidth - barWidth

    const percentage = (currTime - offset) / range

    const position = percentage * width
    const currDisplay = isInTimeFrame(currTime, offset, range) ? "block" : "none"
    ref.current.setAttribute("style", `display: ${currDisplay};transform: translateX(${position}px) scale(1.1)`)
}