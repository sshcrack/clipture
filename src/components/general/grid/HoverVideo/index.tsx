import { BoxProps, Flex, Grid, Slider, SliderFilledTrack, SliderTrack, Text } from '@chakra-ui/react';
import { getVideoSourceUrl, secondsToDuration } from '@general/tools';
import React, { useContext, useEffect, useRef, useState } from "react";
import { VideoGridContext } from '../video';

export default function VideoGridHoverVideo({ source, ...props }: BoxProps & { source: string }) {
    const { gridRef, cachedDurations, setCachedDurations } = useContext(VideoGridContext)

    const [opacity, setOpacity] = useState(0)
    const [hovered, setHovered] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(Infinity)
    const [debounced, setDebounced] = useState(false)

    const ref = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if(!gridRef.current)
            return

        const grid = gridRef.current

        const onFinished = () => setDebounced(true)
        let timerId: NodeJS.Timeout = setTimeout(onFinished, 300)

        const listener = () => {
            if(!timerId)
                clearTimeout(timerId)

            timerId = setTimeout(onFinished, 300)
        }

        grid.addEventListener("scroll", listener)
        return () => {
            grid.removeEventListener("scroll", listener)
            if (!timerId)
                clearTimeout(timerId)
        }
    }, [gridRef])

    useEffect(() => {
        const cached = cachedDurations.get(source)
        if(cached)
            return setDuration(cached)

            if (!ref.current || !debounced)
            return

        const listener = () => {
            setDuration(ref.current.duration)
            cachedDurations.set(source, ref.current.duration)
            setCachedDurations(new Map(cachedDurations.entries()))
        }

        ref.current.addEventListener("loadeddata", listener)
        return () => ref.current?.removeEventListener("loadeddata", listener)
    }, [ref, debounced, cachedDurations])

    useEffect(() => {
        if (!ref.current || !debounced)
            return

        const video = ref.current
        if (!hovered) {
            setOpacity(0)
            return
        }

        const intervalId = setInterval(() => {
            setCurrentTime(video.currentTime)
        }, 25)

        const timeoutId = setTimeout(() => {
            setOpacity(1)
            video.play()
        }, 350)
        return () => {
            clearInterval(intervalId)
            clearTimeout(timeoutId)
            video.pause()
            video.currentTime = 0
            setCurrentTime(0)
        }
    }, [hovered, ref,])

    const videoElement = debounced ?
        <video
            ref={ref}
            src={getVideoSourceUrl(source)}
            style={{
                width: "100%",
                height: "100%",
                opacity,
                objectFit: "cover",
                gridRow: "1",
                gridColumn: "1"
            }}>
        </video> :
        <Flex w='100%' h='100%' gridRow='1' gridColumn='1' />

    return <Grid
        {...props}
    >
        {videoElement}
        <Flex
            gridRow='1'
            gridColumn='1'
            w='100%'
            h='100%'
            justifyContent='end'
            alignItems='end'
        >
            <Text
                p='2'
                bg='rgba(0,0,0,0.75)'
                borderTopLeftRadius='xl'
            >{duration === Infinity ? "Loading..." : secondsToDuration(duration)}</Text>
        </Flex>
        <Flex
            gridRow='1'
            gridColumn='1'
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            zIndex={100}
        >
            <Slider marginTop='auto' aria-label='slider-ex-1' value={isNaN(currentTime) ? 0 : currentTime} max={isNaN(duration) ? Infinity : duration}>
                <SliderTrack>
                    <SliderFilledTrack />
                </SliderTrack>
            </Slider>
        </Flex>
    </Grid>
}