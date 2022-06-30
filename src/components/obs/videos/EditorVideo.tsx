import { Box, Flex, Grid, GridItemProps } from '@chakra-ui/react'
import { getVideoSourceUrl } from '@general/tools'
import { motion } from 'framer-motion'
import React, { useContext, useEffect } from "react"
import { FaPlay } from 'react-icons/fa'
import { RenderLogger } from 'src/interfaces/renderLogger'
import { EditorContext } from './Editor'

const log = RenderLogger.get("components", "obs", "videos", "EditorVideo")
export default function EditorVideo(props: GridItemProps) {
    const { bgGeneratorRef, videoRef, videoName, setDuration, paused, setSelection, setPaused } = useContext(EditorContext)


    const transition = 'all .2s ease-in-out'

    const pauseVideo = (newPaused: boolean) => {
        const video = videoRef?.current
        if (!video)
            return

        !newPaused ? video.play() : video.pause()
        setPaused(video.paused)
    }

    useEffect(() => {
        if (!videoRef?.current)
            return

        const video = videoRef.current
        video.onloadeddata = () => {
            const duration = video.duration
            const selection = {
                end: duration,
                offset: 0,
                range: duration,
                start: 0
            }

            log.log("Setting selection to", selection)
            setDuration(duration)
            setSelection(selection)
            setPaused(false)
            video.play()
        }
    }, [videoRef, setSelection, setDuration])

    return <Grid
        h='32.5em'
        rounded='xl'
        style={{ aspectRatio: "16/9" } as any}
        mb='6'
        {...props}
        overflow='hidden'
    >
        <Box
            w='100%'
            h='100%'
            gridColumn='1'
            gridRow='1'
        >
            <video ref={bgGeneratorRef} style={{ zIndex: -100, width: "100%" }}>
                <source src={getVideoSourceUrl(videoName)}></source>
            </video>
        </Box>
        <Box
            w='100%'
            h='100%'
            gridColumn='1'
            gridRow='1'
        >
            <video ref={videoRef} style={{ zIndex: -10, width: "100%" }}>
                <source src={getVideoSourceUrl(videoName)}></source>
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
                cursor='pointer'
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
        </Flex>
    </Grid>
}