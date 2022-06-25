import { Box, Button, Flex, Grid, Slider, SliderFilledTrack, SliderThumb, SliderTrack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import React, { CSSProperties, useContext, useEffect, useState } from "react"
import { BsArrowCounterclockwise } from 'react-icons/bs'
import { FaPlay, FaPause } from 'react-icons/fa'
import { IoMdCut } from 'react-icons/io'
import { EditorContext } from './Editor'

export default function EditorVideo() {
    const [isVideoHovered, setVideoHovered] = useState(false)
    const [isCuttingClips, setClipsCutting] = useState(false)

    const { onBack, videoRef, duration, clipName, setDuration, paused, selection, setSelection, setPaused } = useContext(EditorContext)


    const transition = 'all .2s ease-in-out'
    const iconStyle = { width: "1.5em", height: "1.5em" }

    const pauseVideo = (newPaused: boolean) => {
        const video = videoRef?.current
        if (!video)
            return

        !newPaused ? video.play() : video.pause()
        setPaused(video.paused)
    }

    const resetSettings = () => {
        setSelection({
            end: duration,
            offset: 0,
            start: 0,
            range: duration
        })
    }


    useEffect(() => {
        if (!videoRef?.current)
            return

        const video = videoRef.current
        video.onloadeddata = () => {
            const duration = video.duration
            setDuration(duration)
            setSelection({
                end: duration,
                offset: 0,
                range: duration,
                start: 0
            })
        }
    }, [videoRef])

    const generateClip = () => {
        if (isCuttingClips)
            return

        setClipsCutting(true)
        const { start, end } = selection
        window.api.clips.cut(clipName, start, end, () => { })
            .then(() => setClipsCutting(false))
        onBack()
    }

    return <Grid
        h='32.5em'
        rounded='xl'
        style={{ aspectRatio: "16/9" } as any}
        overflow='hidden'
        mb='6'
        onMouseEnter={() => setVideoHovered(true)}
        onMouseLeave={() => setVideoHovered(false)}
    >
        <Box
            w='100%'
            h='100%'
            gridColumn='1'
            gridRow='1'
        >
            <video ref={videoRef} style={{ zIndex: -10 }}>
                <source src={`clip-video-file:///${encodeURIComponent(clipName)}`}></source>
            </video>
        </Box>
        <Flex
            gridColumn='1'
            gridRow='1'
            w='100%'
            h='100%'
            zIndex='1'
            flexDir='column'
        >
            <Flex
                flex='1'
                w='100%'
                h='100%'
                justifyContent='center'
                alignItems='center'
                opacity={paused ? 1 : 0}
                transition={transition}
                bg={paused ? "rgba(0,0,0,.4)" : "rgba(0,0,0,0)"}
                onClick={() => pauseVideo(!paused)}
            >
                <motion.div
                    animate={{
                        "--play-size": paused ? "2.5em" : "0em",
                    } as any}
                >
                    <FaPlay style={{ width: 'var(--play-size)', height: 'var(--play-size)', cursor: "pointer" }} />
                </motion.div>
            </Flex>
            <Flex
                w='100%'
                h='10%'
                pl='3'
                pr='3'
                bg='rgba(0,0,0,0.6)'
                transition={transition}
                opacity={paused || isVideoHovered ? "1" : 0}
            >
                <Flex
                    w='100%'
                    h='100%'
                    display='none'
                >
                    <Slider
                        aria-label='time-slider'
                        value={videoRef?.current?.currentTime}
                        defaultValue={0}
                        max={duration}
                    >
                        <SliderTrack>
                            <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                    </Slider>
                </Flex>
                <Flex
                    w='100%'
                    h='100%'
                    justifyContent='space-around'
                    alignItems='center'
                >
                    {([
                        [
                            s => !paused ?
                                <FaPause style={{ ...iconStyle, ...s as any }} /> :
                                <FaPlay style={{ ...iconStyle, ...s as any }} />,
                            !paused ? () => pauseVideo(true) : () => pauseVideo(false)
                        ],
                        [
                            s => <IoMdCut style={{ ...iconStyle, ...s as any }} />,
                            generateClip
                        ],
                        [
                            s => <BsArrowCounterclockwise style={{ ...iconStyle, ...s as any }} />,
                            resetSettings
                        ]
                    ] as [(additionalStyle: CSSProperties) => JSX.Element, () => void][])
                        .map(([element, onClick], i) => <Flex
                            key={`Vide-Item-${i}`}
                            onClick={onClick}
                            w='100%'
                            h='100%'
                            justifyContent='center'
                            alignItems='center'
                            cursor='pointer'
                            _hover={{ "--scaleHover": "1.2" } as any}
                        >
                            {element({
                                transform: "scale(var(--scaleHover, 1))",
                                transition: transition
                            })}
                        </Flex>)
                    }
                </Flex>
            </Flex>
        </Flex>
    </Grid>
}