import { Box, Flex, Grid, GridProps } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import React, { useState } from "react"
import { FaPlay } from 'react-icons/fa'
import { ReactSetState } from 'src/types/reactUtils'

export type BasicVideoProps = {
    source: string,
    bgGeneratorRef?: React.MutableRefObject<HTMLVideoElement>,
    videoRef: React.MutableRefObject<HTMLVideoElement>,
    paused: boolean,
    setPaused: ReactSetState<boolean>
} & GridProps

export default function BasicVideo({ source, bgGeneratorRef, setPaused, paused, videoRef, ...props }: BasicVideoProps) {
    const [, setHovered] = useState(false)

    const transition = 'all .2s ease-in-out'

    const pauseVideo = (newPaused: boolean) => {
        const video = videoRef?.current
        if (!video)
            return

        !newPaused ? video.play() : video.pause()
        setPaused(video.paused)
    }

    return <Grid
        h='32.5em'
        rounded='xl'
        style={{ aspectRatio: "16/9" } as any}
        mb='6'
        overflow='hidden'
        {...props}
    >
        {bgGeneratorRef && <Box
            w='100%'
            h='100%'
            gridColumn='1'
            gridRow='1'
        >
            <video ref={bgGeneratorRef} style={{ zIndex: -100, width: "100%" }}>
                <source src={source} />
            </video>
        </Box>}
        <Box
            w='100%'
            h='100%'
            gridColumn='1'
            gridRow='1'
        >
            <video ref={videoRef} style={{ zIndex: -10, width: "100%" }}>
                <source src={source} />
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
                transition={transition}
                cursor='pointer'
                {/*position='relative'*/...{}}
                style={{ background: paused ? "rgba(0,0,0,.4)" : "rgba(0,0,0,0)" }}
                onClick={() => pauseVideo(!paused)}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <motion.div
                    animate={{
                        "--play-size": paused ? "2.5em" : "0em",
                        opacity: paused ? 1 : 0
                    } as any}
                >
                    <FaPlay style={{ width: 'var(--play-size)', height: 'var(--play-size)', cursor: "pointer" }} />
                </motion.div>
                {/*<Box
                    position='absolute'
                    right='0'
                    bottom='0'
                    w='1em'
                    h='1em'
                >
                    <BsFillVolumeUpFill style={{ width: '1em', height: '1em', cursor: "pointer" }} />
                </Box>*/}
            </Flex>
        </Flex>
        {props.children}
    </Grid>
}