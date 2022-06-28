import { Clip } from '@backend/managers/clip/interface';
import { Flex, Heading, Image, Spinner, Text } from '@chakra-ui/react';
import { RenderGlobals } from '@Globals/renderGlobals';
import React, { useEffect, useState } from 'react';
import PromiseButton from 'src/components/general/buttons/PromiseButton';
import { VideoGrid, VideoGridItem } from 'src/components/general/grid/video';
import HoverVideo from 'src/components/general/HoverVideo';
import prettyMS from "pretty-ms"
import ClipContextMenu from 'src/components/general/menu/ClipContextMenu';

export default function Clips({ additionalElements }: { additionalElements: React.ReactNode }) {
    const [currClips, setCurrClips] = useState<Clip[]>([])
    const [loading, setLoading] = useState(false)
    const [ corruptedClips, setCorruptedClips ] = useState<string[]>([])
    const [update, setUpdate] = useState(0)
    const { clips, system } = window.api

    useEffect(() => {
        setLoading(true)
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
        additionalElements,
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
                <HoverVideo source={clipName} w='100%' h='100%' flex='1' />
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

            return <ClipContextMenu key={`ContextMenu-${i}`} clipName={clipName}>
                {element}
            </ClipContextMenu>
        })
    ]
    const emptyPlaceholder = <Flex
        justifyContent='center'
        alignItems='center'
        w='100%'
        h='100%'
        flexDir='column'
    >
        <Flex flex='1'
            backgroundImage='../assets/illustrations/empty.gif'
            backgroundRepeat='no-repeat'
            backgroundPosition='center'
            backgroundSize='contain'
            w='100%'
            h='100%'
        />
        <Heading fontSize='2.25vw'>Pretty empty isn't it? Gonna ahead, play some games!</Heading>
        <Heading fontSize='1.75vw'>They'll automatically be recorded</Heading>
    </Flex>


    return loading ? <Spinner /> : elements?.length === 0
        ? emptyPlaceholder : <VideoGrid>
            {elements}
        </VideoGrid>
}