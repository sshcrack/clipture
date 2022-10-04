import { ClipProcessingInfo } from '@backend/managers/clip/interface'
import { Flex, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { VideoGridItem } from 'src/components/general/grid/video'
import GradientLoader from '../../general/gradientLoader/gradientLoader'

type ClipInfoArray = [string, ClipProcessingInfo]
export default function ClipProcessingItems() {
    const [clipsProg, setClipsProg] = useState<ClipInfoArray[]>([])
    const [update, setUpdate] = useState(0)

    const { clips } = window.api

    useEffect(() => {
        let shouldAbort = false
        clips.currently_cutting()
            .then(e => !shouldAbort && setClipsProg(e))

        return () => {
            shouldAbort = true
        }
    }, [update])


    useEffect(() => {
        clips.currently_cutting().then(e => setClipsProg(e))
        return clips.add_listener(() => setUpdate(Math.random()))
    }, [])

    const primaryColor = "var(--chakra-colors-brand-primary)"
    const secondaryColor = "var(--chakra-colors-brand-secondary)"
    const elements = clipsProg.map(([_, { info, progress }], i) => {
        const { videoName } = info
        const textPercentage = Math.round(progress.percent * 1000) / 10
        return <VideoGridItem
            update={0}
            type='none'
            key={`${i}-clipProgress`}
            background='var(--chakra-colors-brand-bg)'
            boxShadow='inset 0px 0px 10px 0px var(--chakra-colors-brand-secondary)'
        >
            <motion.div
                style={{
                    display: "grid",
                    flex: 1,
                    width: "100%",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column"
                }}
                initial={{ transform: "scale(1)" }}
                animate={{ transform: "scale(1.1)" }}
                transition={{
                    delay: 0,
                    duration: 2.5,
                    repeat: Infinity,
                    repeatType: "mirror"
                }}
            >
                <Flex
                    w='15em'
                    h='15em'
                    gridRow='1'
                    gridColumn='1'
                >
                    <GradientLoader
                        percent={progress.percent}
                        size='15em'
                        gradient={[primaryColor, secondaryColor]}
                    />
                </Flex>
                <Flex
                    w='15em'
                    h='15em'
                    p='1em'
                    justifyContent='center'
                    alignItems='center'
                    gridRow='1'
                    gridColumn='1'
                    zIndex='10'
                    flexDir='column'
                >
                    <Text color={secondaryColor} fontSize='2em'>Cutting...</Text>
                    <Text color={secondaryColor} fontSize='2em'>{textPercentage.toFixed(1)}%</Text>
                </Flex>
            </motion.div>
            <Flex
                flex='0'
                gap='.25em'
                justifyContent='center'
                alignItems='center'
                flexDir='column'
                bg='brand.bg'
                p='1'
            >
                <Text style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "90%",
                    textAlign: "center"
                }}>{videoName}</Text>
            </Flex>
        </VideoGridItem>
    })

    return elements
}