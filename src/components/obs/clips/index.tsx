import { Clip } from '@backend/managers/clip/interface';
import { CloudClipStatus } from '@backend/managers/cloud/interface';
import { Flex, Heading, Image, Text, Tooltip, useToast } from '@chakra-ui/react';
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

const log = RenderLogger.get("obs", "clips")
export default function Clips({ additionalElements }: { additionalElements: JSX.Element[] }) {
    const [currClips, setCurrClips] = useState<Clip[]>([])
    const [loading, setLoading] = useState(true)
    const [corruptedClips, setCorruptedClips] = useState<string[]>([])
    const [update, setUpdate] = useState(0)
    const [uploadingClips, setUploadingClips] = useState([] as ReadonlyArray<CloudClipStatus>)
    const [openedMenus, setOpenedMenus] = useState([] as string[])
    const { clips, system, obs, cloud } = window.api
    const { t } = useTranslation("dashboard", { keyPrefix: "clips" })

    const toast = useToast()

    useEffect(() => obs.onRecordChange(() => setTimeout(() => setUpdate(Math.random()), 500)), [])
    useEffect(() => cloud.onUpdate(u => setUploadingClips(u)), [])
    useEffect(() => {
        return clips.add_listener((_, prog) => {
            if (prog?.percent !== 1 && prog)
                return

            setUpdate(Math.random())
        })
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
            const { game, clipName, modified, icoName, uploaded } = clip ?? {}
            const { gameName, icon, id } = getGameInfo(game)
            const baseName = clipName.replace(".clipped.mp4", "")

            const imageSrc = `${RenderGlobals.baseUrl}/api/game/image?id=${id ?? "null"}&icon=${icon ?? "null"}`
            const isOpened = openedMenus.some(e => e === clipName)

            const currUploading = uploadingClips.find(e => e.clipName === baseName)

            let element = <VideoGridItem
                update={update}
                type='clips'
                fileName={clipName}
                key={`VideoGrid-${i}`}
                onError={() => setCorruptedClips([...corruptedClips, clipName])}
                onClick={() => location.hash = `/editor/${clipName}`}
            >
                {currUploading && <UploadingStatus status={currUploading.progress} />}
                {!currUploading && (!isOpened ?
                    <HoverVideoWrapper source={clipName} w='100%' h='100%' flex='1' /> :
                    <Flex w='100%' h='100%' flex='1' />
                )}
                <Flex
                    flex='0'
                    gap='.25em'
                    justifyContent='center'
                    alignItems='center'
                    flexDir='column'
                    bg='brand.bg'
                    borderRadius="xl"
                    borderTopLeftRadius='0'
                    borderTopRightRadius='0'
                    p='1'
                >
                    <Flex gap='1em' justifyContent='center' alignItems='center' w='70%'>
                        <Image borderRadius='20%' src={icoName ? getIcoUrl(icoName) : imageSrc} w="1.5em" />
                        <Text>{gameName}</Text>
                        <Text ml='auto'>{prettyMS(Date.now() - modified, { compact: true })}</Text>
                        {uploaded && <Tooltip label='Uploaded  to cloud.' shouldWrapChildren >
                            <MdCloudDone style={{fill: "var(--chakra-colors-green-300)", width: "1.5em", height: "1.5em"}}/>
                        </Tooltip>}
                    </Flex>
                    <Text style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "90%",
                        textAlign: "center"
                    }}>{baseName}</Text>
                </Flex>
            </VideoGridItem>

            if (corruptedClips.includes(clipName))
                element = <VideoGridItem
                    update={update}
                    type='none'
                    background='#3d0000'
                    boxShadow='0px 0px 10px 0px #b60000'
                    key={`corrupted-key-${i}-clips`}
                >
                    <Flex
                        flex='1'
                        w='100%'
                        h='100%'
                        justifyContent='center'
                        alignItems='center'
                        bg='brand.bg'
                        flexDir='column'
                    >
                        <Heading>{t("corrupted_clip")}</Heading>
                        <Flex
                            w='100%'
                            h='100%'
                            flex='1'
                            justifyContent='center'
                            alignItems='center'
                        >
                            <Text>{clipName}</Text>
                        </Flex>
                        <Flex
                            w='100%'
                            justifyContent='space-around'
                            mb='3'
                        >
                            <PromiseButton
                                loadingText={t("opening_folder")}
                                onClick={() => system.open_clip(clipName)}>{t("open_folder")}</PromiseButton>
                            <PromiseButton
                                colorScheme="red"
                                loadingText={t("deleting_clip")}
                                onClick={() => {
                                    return clips.delete(clipName)
                                        .finally(() => setUpdate(Math.random()))
                                }}
                            >{t("delete_clip")}</PromiseButton>
                        </Flex>
                    </Flex>
                </VideoGridItem>

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
                    {element}
                </ClipContextMenu>
            </RenderIfVisible>
        })
    ]


    return loading ? <GeneralSpinner size='70' loadingText={t("loading")} /> : elements?.length === 0
        ? <EmptyPlaceholder /> : <VideoGrid>
            {elements}
        </VideoGrid>
}