import { BoxProps, Flex, Grid, GridItem, Slider, SliderFilledTrack, SliderThumb, SliderTrack } from '@chakra-ui/react';
import { getVideoSourceUrl } from '@general/tools';
import React, { useEffect, useRef, useState } from "react"

export default function HoverVideo({ source, ...props }: BoxProps & { source: string }) {
    const [opacity, setOpacity] = useState(0)
    const [hovered, setHovered] = useState(false)
    const [ currentTime, setCurrentTime] = useState(0)
    const [ duration, setDuration] = useState(Infinity)
    const ref = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (!ref.current)
            return

        const video = ref.current
        if (!hovered) {
            setOpacity(0)
            return
        }

        console.log("Hovered")
        setDuration(video.duration)
        const intervalId = setInterval(() => {
            setCurrentTime(video.currentTime)
        }, 25)

        const timeoutId = setTimeout(() => {
            setOpacity(1)
            console.log("Play")
            video.play()
        }, 100)
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
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            zIndex={100}
        >
            <Slider marginTop='auto' aria-label='slider-ex-1' value={currentTime} max={duration}>
                <SliderTrack>
                    <SliderFilledTrack />
                </SliderTrack>
            </Slider>
        </Flex>
    </Grid>
}