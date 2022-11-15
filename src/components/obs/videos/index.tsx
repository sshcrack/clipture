import { Video } from '@backend/managers/clip/interface';
import { Flex, useToast } from '@chakra-ui/react';
import { getIcoUrl } from '@general/tools';
import { getGameInfo } from '@general/tools/game';
import { RenderGlobals } from '@Globals/renderGlobals';
import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import RenderIfVisible from 'react-render-if-visible';
import HoverVideoWrapper from 'src/components/general/grid/HoverVideo/HoverVideoWrapper';
import HoverVideoBookmarks from 'src/components/general/grid/HoverVideo/inner/HoverVideoBookmarks';
import HoverVideoInner from 'src/components/general/grid/HoverVideo/inner/HoverVideoInner';
import { VideoGrid, VideoGridItem } from 'src/components/general/grid/video';
import GeneralInfo from 'src/components/general/info/GeneralInfo';
import GeneralInfoModified from 'src/components/general/info/GeneralInfoModified';
import GeneralInfoProvider from 'src/components/general/info/GeneralInfoProvider';
import { SelectionProvider } from 'src/components/general/info/SelectionProvider';
import VideoContextMenu from 'src/components/general/menu/VideoContextMenu';
import EmptyPlaceholder from 'src/components/general/placeholder/EmptyPlaceholder';
import GeneralSpinner from 'src/components/general/spinner/GeneralSpinner';
import { useSession } from 'src/components/hooks/useSession';
import { RenderLogger } from 'src/interfaces/renderLogger';

const log = RenderLogger.get("obs", "clips")

export default function Videos({ additionalElements }: { additionalElements?: JSX.Element[] }) {
    const toast = useToast()
    const [retry, setRetry] = useState(0)
    const [update, setUpdate] = useState(0)
    const [currVideos, setVideos] = React.useState<Video[]>([])
    const [openedMenus, setOpenedMenus] = useState([] as string[])
    const [lockedVideos, setLockedVideos] = useState([] as string[])
    const [loading, setLoading] = React.useState(true)
    const { status } = useSession()

    const { videos, obs, storage } = window.api
    const { t } = useTranslation("dashboard", { "keyPrefix": "videos" })

    useEffect(() => {
        setRetry(Math.random())
    }, [ status ])

    useEffect(() => {
        const funcs = [
            obs.onRecordChange(() => setTimeout(() => setRetry(Math.random()), 500)),
            storage.onVideosLocked(e => {
                if (e.length === 0)
                    setRetry(Math.random())

                setLockedVideos(e)
            })
        ]

        return () => {
            funcs.forEach(e => e())
        }
    }, [])
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


    const clipElements = currVideos.map(({ displayName, game, videoName, modified, bookmarks, icoName }, i) => {
        const { gameName, icon, id } = getGameInfo(game, videoName)
        const imageSrc = `${RenderGlobals.baseUrl}/api/game/image?id=${id ?? "null"}&icon=${icon ?? "null"}&update=${retry}`
        const isOpened = openedMenus.some(e => e === videoName)
        const isLocked = lockedVideos.some(e => e === videoName)
        console.log("Locked", lockedVideos, videoName)

        const onEditor = () => location.hash = `/editor/${videoName}`
        const ico = icoName ? getIcoUrl(icoName) : imageSrc
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
                    {!isOpened && !isLocked ? <HoverVideoWrapper
                        source={videoName}
                        w='100%'
                        h='100%'
                        flex='1'
                        onClick={onEditor}
                    >
                        <HoverVideoInner>
                            {bookmarks && <HoverVideoBookmarks bookmarks={bookmarks} />}
                        </HoverVideoInner>
                    </HoverVideoWrapper> : <Flex w='100%' h='100%' flex='1' onClick={onEditor} />}
                    <GeneralInfoProvider baseName={videoName} onEditor={onEditor}>
                        <GeneralInfo
                            displayName={displayName}
                            baseName={videoName}
                            gameName={gameName}
                            imageSrc={ico}
                            cloud={null}
                            displayGame
                        >
                            <GeneralInfoModified modified={modified} />
                        </GeneralInfo>
                    </GeneralInfoProvider>
                </VideoGridItem>
            </VideoContextMenu>
        </RenderIfVisible>
    })

    const elements = [
        ...additionalElements,
        ...clipElements
    ]

    return <SelectionProvider available={currVideos.map(e => e.videoName)}>
        {loading ? <GeneralSpinner size='70' loadingText={t("loading")} /> : elements?.length === 0
            ? <EmptyPlaceholder /> : <Flex w='100%' h='100%' flexDir='column'>
                <VideoGrid>
                    {elements}
                </VideoGrid>
            </Flex>
        }
    </SelectionProvider>
}
