import { ClipProcessingInfo } from '@backend/managers/clip/interface'
import { Flex, Text } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { VideoGridItem } from 'src/components/general/grid/video'
import AnimatedProgress from './AnimatedProgress'

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
        return <VideoGridItem
            update={0}
            type='none'
            key={`${i}-clipProgress`}
            background='var(--chakra-colors-brand-bg)'
            boxShadow='inset 0px 0px 10px 0px var(--chakra-colors-brand-secondary)'
        >
            <AnimatedProgress
                status={"Cutting..."}
                percent={progress?.percent ?? 0}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                animate={true}
            />
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