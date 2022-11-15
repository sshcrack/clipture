import { Clip } from '@backend/managers/clip/interface';
import { CloudClipStatus, CloudUsage } from '@backend/managers/cloud/interface';
import { Flex, Tooltip, useToast } from '@chakra-ui/react';
import { getIcoUrl } from '@general/tools';
import { getGameInfo } from '@general/tools/game';
import { RenderGlobals } from '@Globals/renderGlobals';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdCloudDone } from "react-icons/md";
import RenderIfVisible from 'react-render-if-visible';
import HoverVideoWrapper from 'src/components/general/grid/HoverVideo/HoverVideoWrapper';
import HoverVideoCloudVisibility from 'src/components/general/grid/HoverVideo/inner/HoverVideoCloudVisibility';
import HoverVideoInner from 'src/components/general/grid/HoverVideo/inner/HoverVideoInner';
import "src/components/general/grid/placeholder.css";
import { VideoGrid, VideoGridItem } from 'src/components/general/grid/video';
import GeneralInfo from 'src/components/general/info/GeneralInfo';
import GeneralInfoModified from 'src/components/general/info/GeneralInfoModified';
import GeneralInfoProvider from 'src/components/general/info/GeneralInfoProvider';
import { SelectionProvider } from 'src/components/general/info/SelectionProvider';
import ClipContextMenu from 'src/components/general/menu/ClipContextMenu';
import EmptyPlaceholder from 'src/components/general/placeholder/EmptyPlaceholder';
import GeneralSpinner from 'src/components/general/spinner/GeneralSpinner';
import { useSession } from 'src/components/hooks/useSession';
import { RenderLogger } from 'src/interfaces/renderLogger';
import UploadingStatus from '../progress/UploadingStatus';

const log = RenderLogger.get("obs", "clips")
export default function Clips({ additionalElements }: { additionalElements: JSX.Element[] }) {
    const [currClips, setCurrClips] = useState<Clip[]>([])
    const [loading, setLoading] = useState(true)
    const [update, setUpdate] = useState(0)
    const [, setUsage] = useState(null as CloudUsage)
    const [uploadingClips, setUploadingClips] = useState([] as ReadonlyArray<CloudClipStatus>)
    const [openedMenus, setOpenedMenus] = useState([] as string[])
    const { clips, obs, cloud } = window.api
    const { t } = useTranslation("dashboard", { keyPrefix: "clips" })
    const { status } = useSession()

    const toast = useToast()


    useEffect(() => {
        setUpdate(Math.random())
    }, [status])

    useEffect(() => {
        const unregister = [
            obs.onRecordChange(() => setTimeout(() => setUpdate(Math.random()), 500)),
            cloud.onUpdate(u => setUploadingClips(u)),
            clips.add_listener((_, prog) => {
                if (prog?.percent !== 1 && prog)
                    return

                console.log("Received clip update.")
                setUpdate(Math.random())
            })
        ]

        cloud.usage().then(e => setUsage(e))
        return () => { unregister.map(e => e()) }
    }, [])

    useEffect(() => {
        clips.list().then(e => {
            setLoading(false)
            setCurrClips(e)
        }).catch(e => {
            log.error(e)
            toast({
                title: t("could_not_list"),
                description: t("retry", { message: e.message }),
            })
            setTimeout(() => setUpdate(Math.random()), 5000)
        })
    }, [update])

    const elements = [
        ...additionalElements,
        ...currClips.map((clip, i) => {
            const { game, clipName, modified, icoName, uploaded, original, tooLarge, cloud } = clip ?? {}
            const { gameName, icon, id } = getGameInfo(game, original)
            const baseName = clipName.replace(".clipped.mp4", "")

            const imageSrc = cloud && icoName ? `${RenderGlobals.baseUrl}/api/clip/icon/${icoName}` : `${RenderGlobals.baseUrl}/api/game/image?id=${id ?? "null"}&icon=${icon ?? "null"}`
            const ico = (icoName && !cloud ? getIcoUrl(icoName) : imageSrc) + `&update=${update}`
            const isOpened = openedMenus.some(e => e === clipName)

            const currUploading = uploadingClips.find(e => e.clipName === baseName)

            const cloudOnly = cloud?.cloudOnly
            const onEditor = () => cloud?.cloudOnly ? window.api.cloud.openId(cloud.id) : location.hash = `/editor/${clipName}`
            return <RenderIfVisible
                defaultHeight={416}
                key={`RenderIfVisible-${i}`}
                placeholderElementClass='grid-placeholder'
                rootElementClass='grid-root-element'
            >
                <ClipContextMenu
                    clipName={cloud ? cloud.id : clipName}
                    setUpdate={setUpdate}
                    uploaded={uploaded}
                    tooLarge={tooLarge}
                    cloudDisabled={!!currUploading}
                    cloud={cloud}
                    setOpen={opened => {
                        const filtered = openedMenus.concat([]).filter(e => e !== clipName)
                        if (!opened)
                            return setOpenedMenus(filtered)

                        filtered.push(clipName)
                        setOpenedMenus(filtered)
                    }}
                >
                    <VideoGridItem
                        update={update}
                        type='clips'
                        fileName={cloudOnly ? `cloud#${cloud.id}` : clipName}
                        key={`VideoGrid-${i}`}
                    >
                        {currUploading && <UploadingStatus status={currUploading.progress} />}
                        {!currUploading && (!isOpened ?
                            <HoverVideoWrapper
                                source={clipName}
                                cloudId={cloudOnly && cloud?.id}
                                w='100%'
                                h='100%'
                                flex='1'
                                onClick={onEditor}
                            >
                                <HoverVideoInner>
                                    {cloud && <HoverVideoCloudVisibility cloud={cloud} />}
                                </HoverVideoInner>
                            </HoverVideoWrapper> :
                            <Flex w='100%' h='100%' flex='1' onClick={onEditor} />
                        )}
                        <GeneralInfoProvider baseName={baseName} onEditor={onEditor}>
                            <GeneralInfo
                                baseName={baseName}
                                gameName={gameName}
                                imageSrc={ico}
                                cloud={cloud}
                                displayGame
                            >
                                <GeneralInfoModified modified={modified} />
                                {(uploaded || cloudOnly) && <Tooltip label={uploaded ? t("uploaded_to_cloud") : t("cloud_only")} shouldWrapChildren >
                                    <MdCloudDone style={{ fill: "var(--chakra-colors-green-300)", width: "1.5em", height: "1.5em" }} />
                                </Tooltip>}
                            </GeneralInfo>
                        </GeneralInfoProvider>
                    </VideoGridItem>
                </ClipContextMenu>
            </RenderIfVisible>
        })
    ]


    return <SelectionProvider
        available={currClips.map(e => e.clipName.split(".clipped.mp4").join(""))}
    >
        {
            loading ? <GeneralSpinner size='70' loadingText={t("loading")} /> : elements?.length === 0
                ? <EmptyPlaceholder /> : <Flex w='100%' h='100%' flexDir='column'><VideoGrid>
                    {elements}
                </VideoGrid></Flex>
        }
    </SelectionProvider >

}