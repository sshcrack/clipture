import { Clip } from '@backend/managers/clip/interface';
import { Flex, Heading, Image, Text } from '@chakra-ui/react';
import { RenderGlobals } from '@Globals/renderGlobals';
import prettyMS from "pretty-ms";
import React, { useEffect, useState } from 'react';
import RenderIfVisible from 'react-render-if-visible';
import PromiseButton from 'src/components/general/buttons/PromiseButton';
import HoverVideoWrapper from 'src/components/general/grid/HoverVideo/HoverVideoWrapper';
import "src/components/general/grid/placeholder.css";
import { VideoGrid, VideoGridItem } from 'src/components/general/grid/video';
import ClipContextMenu from 'src/components/general/menu/ClipContextMenu';
import EmptyPlaceholder from 'src/components/general/placeholder/EmptyPlaceholder';
import GeneralSpinner from 'src/components/general/spinner/GeneralSpinner';

export default function Clips({ additionalElements }: { additionalElements: JSX.Element[] }) {
    const [currClips, setCurrClips] = useState<Clip[]>([])
    const [loading, setLoading] = useState(true)
    const [corruptedClips, setCorruptedClips] = useState<string[]>([])
    const [update, setUpdate] = useState(0)
    const { clips, system } = window.api

    useEffect(() => {5
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
        })
    }, [update])

    const elements = [
        ...additionalElements,
        ...currClips.map((clip, i) => {
            const { game, clipName, modified } = clip ?? {}
            const { name, aliases, id, icon } = game ?? {}

            const gameName = name ?? aliases?.[0] ?? "Unknown Game"
            const imageSrc = `${RenderGlobals.baseUrl}/api/game/image?id=${id ?? "null"}&icon=${icon ?? "null"}`

            let element = <VideoGridItem
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
                        <Heading>CORRUPTED CLIP</Heading>
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
                                loadingText='Opening folder...'
                                onClick={() => system.open_clip(clipName)}>Open affected clip</PromiseButton>
                            <PromiseButton
                                colorScheme="red"
                                loadingText='Deleting clip...'
                                onClick={() => clips.delete(clipName)}
                            >Delete Clip</PromiseButton>
                        </Flex>
                    </Flex>
                </VideoGridItem>

            return <RenderIfVisible
                defaultHeight={416}
                key={`RenderIfVisible-${i}`}
                placeholderElementClass='grid-placeholder'
                rootElementClass='grid-root-element'
            >
                <ClipContextMenu clipName={clipName}>
                    {element}
                </ClipContextMenu>
            </RenderIfVisible>
        })
    ]


    return loading ? <GeneralSpinner size='70' /> : elements?.length === 0
        ? <EmptyPlaceholder /> : <VideoGrid>
            {elements}
        </VideoGrid>
}