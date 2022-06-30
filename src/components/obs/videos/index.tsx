import { Video } from '@backend/managers/clip/interface';
import { Flex, Image, Spinner, Text, useToast } from '@chakra-ui/react';
import { RenderGlobals } from '@Globals/renderGlobals';
import prettyMS from "pretty-ms"
import React, { useEffect, useState } from "react";
import { VideoGrid, VideoGridItem } from 'src/components/general/grid/video';
import HoverVideo from 'src/components/general/HoverVideo';
import VideoContextMenu from 'src/components/general/menu/VideoContextMenu';
import { RenderLogger } from 'src/interfaces/renderLogger';

const log = RenderLogger.get("obs", "clips")

export default function Videos({ additionalElements }: { additionalElements?: JSX.Element[] }) {
    const toast = useToast()
    const [retry, setRetry] = useState(0)
    const [currVideos, setVideos] = React.useState<Video[]>([])
    const [loading, setLoading] = React.useState(false)

    const { videos } = window.api
    useEffect(() => {
        setLoading(true)
        videos.list()
            .then(e => {
                setVideos(e)
                setLoading(false)
            })
            .catch(e => {
                log.error(e)
                toast({
                    title: "Could not list videos",
                    description: `${e.message}. Retrying in 5 seconds`,
                })
                setTimeout(() => setRetry(Math.random()))
            })
    }, [retry])

    const clipElements = currVideos.map(({ info, videoName, modified }, i) => {
        const { id, name, aliases, icon } = info ?? {}

        const gameName = name ?? aliases?.[0] ?? "Unknown Game"
        const imageSrc = `${RenderGlobals.baseUrl}/api/game/image?id=${id ?? "null"}&icon=${icon ?? "null"}`
        return <VideoContextMenu videoName={videoName}>

            <VideoGridItem key={`${i}-videoElements`}
                type='videos'
                fileName={videoName}
                onClick={() => location.hash = `/editor/${videoName}`}
            >
                <HoverVideo source={videoName} w='100%' h='100%' flex='1' />
                <Flex
                    flex='0'
                    gap='.25em'
                    justifyContent='center'
                    alignItems='center'
                    flexDir='column'
                    borderRadius="xl"
                    borderTopLeftRadius='0'
                    borderTopRightRadius='0'
                    bg='brand.bg'
                    p='1'
                >
                    <Flex gap='1em' justifyContent='center' alignItems='center' w='70%'>
                        <Image src={imageSrc} w="1.5em" />
                        <Text>{gameName}</Text>
                        <Text ml='auto'>{prettyMS(Date.now() - modified, { compact: true })}</Text>
                    </Flex>
                    <Text style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "90%",
                        textAlign: "center"
                    }}>{videoName}</Text>
                </Flex>
            </VideoGridItem>
        </VideoContextMenu>
    })

    const elements = [
        ...additionalElements,
        ...clipElements
    ]

    return loading ? <Spinner /> : <VideoGrid>
        {elements}
    </VideoGrid>
}
