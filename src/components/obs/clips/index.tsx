import { Clip } from '@backend/managers/clip/interface';
import { CloudClipStatus } from '@backend/managers/cloud/interface';
import { Checkbox, Flex, Grid, Heading, Image, Text, Tooltip, useToast } from '@chakra-ui/react';
import { getIcoUrl } from '@general/tools';
import { getGameInfo } from '@general/tools/game';
import { RenderGlobals } from '@Globals/renderGlobals';
import prettyMS from "pretty-ms";
import { MdCloudDone } from "react-icons/md"
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RenderIfVisible from 'react-render-if-visible';
import PromiseButton from 'src/components/general/buttons/PromiseButton';
import HoverVideoWrapper from 'src/components/general/grid/HoverVideo/HoverVideoWrapper';
import "src/components/general/grid/placeholder.css";
import { VideoGrid, VideoGridItem } from 'src/components/general/grid/video';
import ClipContextMenu from 'src/components/general/menu/ClipContextMenu';
import EmptyPlaceholder from 'src/components/general/placeholder/EmptyPlaceholder';
import GeneralSpinner from 'src/components/general/spinner/GeneralSpinner';
import { RenderLogger } from 'src/interfaces/renderLogger';
import UploadingStatus from '../progress/UploadingStatus';
import GeneralInfo from 'src/components/general/info/GeneralInfo';
import GeneralInfoProvider from 'src/components/general/info/GeneralInfoProvider';
import { SelectionProvider } from 'src/components/general/info/SelectionProvider';

const log = RenderLogger.get("obs", "clips")
export default function Clips({ additionalElements }: { additionalElements: JSX.Element[] }) {
    const [currClips, setCurrClips] = useState<Clip[]>([])
    const [loading, setLoading] = useState(true)
    const [update, setUpdate] = useState(0)
    const [uploadingClips, setUploadingClips] = useState([] as ReadonlyArray<CloudClipStatus>)
    const [openedMenus, setOpenedMenus] = useState([] as string[])
    const { clips, obs, cloud } = window.api
    const { t } = useTranslation("dashboard", { keyPrefix: "clips" })

    const toast = useToast()

    useEffect(() => {
        const unregister = [
            obs.onRecordChange(() => setTimeout(() => setUpdate(Math.random()), 500)),
            cloud.onUpdate(u => setUploadingClips(u)),
            clips.add_listener((_, prog) => {
                if (prog?.percent !== 1 && prog)
                    return

                setUpdate(Math.random())
            })
        ]

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
            const { game, clipName, modified, icoName, uploaded, original } = clip ?? {}
            const { gameName, icon, id } = getGameInfo(game, original)
            const baseName = clipName.replace(".clipped.mp4", "")

            const imageSrc = `${RenderGlobals.baseUrl}/api/game/image?id=${id ?? "null"}&icon=${icon ?? "null"}`
            const isOpened = openedMenus.some(e => e === clipName)

            const currUploading = uploadingClips.find(e => e.clipName === baseName)

            const onEditor = () => location.hash = `/editor/${clipName}`
            return <RenderIfVisible
                defaultHeight={416}
                key={`RenderIfVisible-${i}`}
                placeholderElementClass='grid-placeholder'
                rootElementClass='grid-root-element'
            >
                <ClipContextMenu
                    clipName={clipName}
                    setUpdate={setUpdate}
                    uploaded={uploaded}
                    cloudDisabled={!!currUploading}
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
                        fileName={clipName}
                        key={`VideoGrid-${i}`}
                    >
                        {currUploading && <UploadingStatus status={currUploading.progress} />}
                        {!currUploading && (!isOpened ?
                            <HoverVideoWrapper
                                source={clipName}
                                w='100%'
                                h='100%'
                                flex='1'
                                onClick={onEditor}
                            /> :
                            <Flex w='100%' h='100%' flex='1' onClick={onEditor} />
                        )}
                        <GeneralInfoProvider baseName={baseName} onEditor={onEditor}>
                            <GeneralInfo
                                baseName={baseName}
                                gameName={gameName}
                                icoName={icoName}
                                imageSrc={imageSrc}
                                modified={modified}
                            >
                                {uploaded && <Tooltip label='Uploaded  to cloud.' shouldWrapChildren >
                                    <MdCloudDone style={{ fill: "var(--chakra-colors-green-300)", width: "1.5em", height: "1.5em" }} />
                                </Tooltip>}
                            </GeneralInfo>
                        </GeneralInfoProvider>
                    </VideoGridItem>
                </ClipContextMenu>
            </RenderIfVisible>
        })
    ]


    return <SelectionProvider available={currClips.map(e => e.clipName.split(".clipped.mp4").join(""))}>
        {
            loading ? <GeneralSpinner size='70' loadingText={t("loading")} /> : elements?.length === 0
                ? <EmptyPlaceholder /> : <Flex w='100%' h='100%' flexDir='column'><VideoGrid>
                    {elements}
                </VideoGrid></Flex>
        }
    </SelectionProvider >

}