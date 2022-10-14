import { Video } from '@backend/managers/clip/interface';
import { Flex, useToast } from '@chakra-ui/react';
import { getGameInfo } from '@general/tools/game';
import { RenderGlobals } from '@Globals/renderGlobals';
import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import RenderIfVisible from 'react-render-if-visible';
import HoverVideoWrapper from 'src/components/general/grid/HoverVideo/HoverVideoWrapper';
import { VideoGrid, VideoGridItem } from 'src/components/general/grid/video';
import GeneralInfo from 'src/components/general/info/GeneralInfo';
import GeneralInfoProvider from 'src/components/general/info/GeneralInfoProvider';
import { SelectionProvider } from 'src/components/general/info/SelectionProvider';
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
    const [openedMenus, setOpenedMenus] = useState([] as string[])
    const [loading, setLoading] = React.useState(true)

    const { videos, obs } = window.api
    const { t } = useTranslation("dashboard", { "keyPrefix": "videos" })

    useEffect(() => obs.onRecordChange(() => setTimeout(() => setRetry(Math.random()), 500)), [])
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
    const clipElements = currVideos.map(({ game, videoName, modified, bookmarks, icoName }, i) => {
        const { gameName, icon, id } = getGameInfo(game)
        const imageSrc = `${RenderGlobals.baseUrl}/api/game/image?id=${id ?? "null"}&icon=${icon ?? "null"}`
        const isOpened = openedMenus.some(e => e === videoName)

        const onEditor = () => location.hash = `/editor/${videoName}`
        return <RenderIfVisible
            defaultHeight={416}
            key={`RenderIfVisible-${i}`}
            placeholderElementClass='grid-placeholder'
            rootElementClass='grid-root-element'
        >
            <VideoContextMenu
                videoName={videoName}
                setUpdate={setRetry}
                setOpen={opened => {
                    console.log("Opened is", opened)
                    const filtered = openedMenus.concat([]).filter(e => e !== videoName)
                    if (!opened)
                        return setOpenedMenus(filtered)

                    filtered.push(videoName)
                    setOpenedMenus(filtered)
                }}
            >

                <VideoGridItem
                    update={update}
                    type='videos'
                    fileName={videoName}
                >
                    {!isOpened ? <HoverVideoWrapper
                        source={videoName}
                        bookmarks={bookmarks}
                        w='100%'
                        h='100%'
                        flex='1'
                        onClick={onEditor}
                    /> : <Flex w='100%' h='100%' flex='1' onClick={onEditor} />}
                    <GeneralInfoProvider baseName={videoName} onEditor={onEditor}>
                        <GeneralInfo
                            baseName={videoName}
                            gameName={gameName}
                            icoName={icoName}
                            imageSrc={imageSrc}
                            modified={modified}
                        />
                    </GeneralInfoProvider>
                </VideoGridItem>
            </VideoContextMenu>
        </RenderIfVisible>
    })

    const elements = [
        ...additionalElements,
        ...clipElements
    ]

    return <SelectionProvider>
        {loading ? <GeneralSpinner size='70' loadingText={t("loading")} /> : elements?.length === 0
            ? <EmptyPlaceholder /> : <Flex w='100%' h='100%' flexDir='column'>
                <VideoGrid>
                    {elements}
                </VideoGrid>
            </Flex>
        }
    </SelectionProvider>
}
