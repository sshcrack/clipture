import { ExtendedClip } from '@backend/managers/clip/interface';
import { Button, Flex, Heading, Image, Spinner, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import PromiseButton from 'src/components/general/buttons/PromiseButton';
import { VideoGrid, VideoGridItem } from 'src/components/general/grid/video';

export default function Clips({ additionalElements }: { additionalElements: React.ReactChild[] }) {
    const [currClips, setCurrClips] = useState<ExtendedClip[]>([])
    const [loading, setLoading] = useState(false)
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
        ...additionalElements,
        ...currClips.map((clip, i) => {
            const { original, thumbnail, game, clipName, clipPath } = clip ?? {}

            if (!thumbnail)
                return <VideoGridItem
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
                        backdropFilter="blur(4px)"
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
                                onClick={() => system.open_folder(clipPath)}>Open affected clip</PromiseButton>
                            <PromiseButton
                                colorScheme="red"
                                loadingText='Deleting clip...'
                                onClick={() => clips.delete(clipName)}
                            >Delete Clip</PromiseButton>
                        </Flex>

                    </Flex>
                </VideoGridItem>

            return <VideoGridItem
                background='blue'
                key={`VideoGrid-${i}`}
            >

            </VideoGridItem>
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