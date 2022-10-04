import { Clip } from '@backend/managers/clip/interface';
import { Flex, Heading, Image, Text, useToast } from '@chakra-ui/react';
import { getGameInfo } from '@general/tools/game';
import { RenderGlobals } from '@Globals/renderGlobals';
import prettyMS from "pretty-ms";
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

const log = RenderLogger.get("obs", "clips")
export default function Clips({ additionalElements }: { additionalElements: JSX.Element[] }) {
    const [currClips, setCurrClips] = useState<Clip[]>([])
    const [loading, setLoading] = useState(true)
    const [corruptedClips, setCorruptedClips] = useState<string[]>([])
    const [update, setUpdate] = useState(0)
    const { clips, system } = window.api
    const { t } = useTranslation("dashboard", { keyPrefix: "clips" })

    const toast = useToast()

    useEffect(() => {
        clips.add_listener((_, prog) => {
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
            const { game, clipName, modified } = clip ?? {}
            const { gameName, icon, id } = getGameInfo(game)

            const imageSrc = `${RenderGlobals.baseUrl}/api/game/image?id=${id ?? "null"}&icon=${icon ?? "null"}`

            let element = <VideoGridItem
                update={update}
                type='clips'
                fileName={clipName}
                key={`VideoGrid-${i}`}
                onError={() => setCorruptedClips([...corruptedClips, clipName])}
                onClick={() => location.hash = `/editor/${clipName}`}
            >
                <HoverVideoWrapper source={clipName} w='100%' h='100%' flex='1' />
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
                    }}>{clipName.replace(".clipped.mp4", "")}</Text>
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