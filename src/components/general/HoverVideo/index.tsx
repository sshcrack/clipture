import { BoxProps, Flex, Grid, Slider, SliderFilledTrack, SliderTrack, Text } from '@chakra-ui/react';
import { getVideoSourceUrl, secondsToDuration } from '@general/tools';
import React, { useEffect, useRef, useState } from "react";

export default function HoverVideo({ source, ...props }: BoxProps & { source: string }) {
    const [opacity, setOpacity] = useState(0)
    const [hovered, setHovered] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(Infinity)
    const ref = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (!ref.current)
            return

        const listener = () => {
            setDuration(ref.current.duration)
        }

        ref.current.addEventListener("loadeddata", listener)
        return () => ref.current?.removeEventListener("loadeddata", listener)
    }, [ref])

    useEffect(() => {
        if (!ref.current)
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
    }, [hovered, ref])

    return <Grid
        {...props}
    >
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
        </video>
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
            >{duration === Infinity ? "" : secondsToDuration(duration)}</Text>
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