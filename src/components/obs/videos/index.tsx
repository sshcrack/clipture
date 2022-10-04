import { Video } from '@backend/managers/clip/interface';
import { Flex, Image, Text, useToast } from '@chakra-ui/react';
import { getGameInfo } from '@general/tools/game';
import { RenderGlobals } from '@Globals/renderGlobals';
import prettyMS from "pretty-ms";
import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import RenderIfVisible from 'react-render-if-visible';
import HoverVideoWrapper from 'src/components/general/grid/HoverVideo/HoverVideoWrapper';
import MultipleSelect from 'src/components/general/grid/multipleSelect/multipleSelect';
import MultipleSelectProvider from 'src/components/general/grid/multipleSelect/provider';
import { VideoGrid, VideoGridItem } from 'src/components/general/grid/video';
import VideoContextMenu from 'src/components/general/menu/VideoContextMenu';
import EmptyPlaceholder from 'src/components/general/placeholder/EmptyPlaceholder';
import GeneralSpinner from 'src/components/general/spinner/GeneralSpinner';
import { RenderLogger } from 'src/interfaces/renderLogger';

const log = RenderLogger.get("obs", "clips")

export default function Videos({ additionalElements }: { additionalElements?: JSX.Element[] }) {
    const toast = useToast()
    const [retry, setRetry] = useState(0)
    const [update, setUpdate] = useState(0)
    const [currVideos, setVideos] = React.useState<Video[]>([])
    const [loading, setLoading] = React.useState(true)

    const { videos } = window.api
    const { t } = useTranslation("dashboard", { "keyPrefix": "videos" })
    useEffect(() => {
        videos.list()
            .then(e => {
                setVideos(e)
                setUpdate(Math.random())
                setLoading(false)
            })
            .catch(e => {
                log.error(e)
                toast({
                    title: t("could_not_list"),
                    description: t("retry", { message: e.message }),
                })
                setTimeout(() => setRetry(Math.random()), 5000)
            })
    }, [retry])

    console.log("retry is", retry)
    const clipElements = currVideos.map(({ game, videoName, modified, bookmarks }, i) => {
        const { gameName, icon, id } = getGameInfo(game)
        const imageSrc = `${RenderGlobals.baseUrl}/api/game/image?id=${id ?? "null"}&icon=${icon ?? "null"}`
        return <RenderIfVisible
            defaultHeight={416}
            key={`RenderIfVisible-${i}`}
            placeholderElementClass='grid-placeholder'
            rootElementClass='grid-root-element'
        >
            <VideoContextMenu
                videoName={videoName}
                setUpdate={setRetry}
            >

                <VideoGridItem
                    update={update}
                    type='videos'
                    fileName={videoName}
                    onClick={() => location.hash = `/editor/${videoName}`}
                >
                    <HoverVideoWrapper
                        source={videoName}
                        bookmarks={bookmarks}
                        w='100%'
                        h='100%'
                        flex='1'
                    />
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
                            <Image borderRadius='20%' src={imageSrc} w="1.5em" />
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
        </RenderIfVisible>
    })

    const elements = [
        ...additionalElements,
        ...clipElements
    ]

    return loading ? <GeneralSpinner size='70' loadingText={t("loading")} /> : elements?.length === 0
        ? <EmptyPlaceholder /> : <VideoGrid>
                {elements}
        </VideoGrid>
}
