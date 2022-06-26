import "src/pages/dashboard/scrollbar.css";

import { Video } from '@backend/managers/clip/interface';
import { Button, Flex, Image, Spinner, Text, useToast } from '@chakra-ui/react';
import { RenderGlobals } from '@Globals/renderGlobals';
import React, { useEffect, useState } from "react";
import { VideoGrid, VideoGridItem } from 'src/components/general/grid/video';
import { RenderLogger } from 'src/interfaces/renderLogger';
import Editor from './Editor';
import EditorVideo from './EditorVideo';
import EditorMainBar from './bar/EditorMainBar';
import EditorSeekBar from './bar/EditorSeekBar';
import EditorStartBar from './bar/EditorStartBar';
import EditorEndBar from './bar/EditorEndBar';
import EditorTimelineTop from './timelineTop/EditorTimelineTop';
import EditorCutHighlight from './bar/EditorCutHighlight';
import TitleBarItem from 'src/components/titlebar/TitleBarItem';
import { FaArrowLeft } from 'react-icons/fa';

const log = RenderLogger.get("obs", "clips")

export default function Videos({ additionalElements = [] }: { additionalElements?: React.ReactChild[] }) {
    const toast = useToast()
    const [retry, setRetry] = useState(0)
    const [currVideos, setVideos] = React.useState<Video[]>([])
    const [currSelected, setCurrSelected] = React.useState<string | null>("2022-06-24 23-11-17.mkv")
    const [loading, setLoading] = React.useState(false)

    const { videos } = window.api
    useEffect(() => {
        setLoading(true)
        videos.list()
            .then(e => {
                setVideos(e)
                setLoading(false)
            })
            .catch(e => {
                log.error(e)
                toast({
                    title: "Could not list videos",
                    description: `${e.message}. Retrying in 5 seconds`,
                })
                setTimeout(() => setRetry(Math.random()))
            })
    }, [retry])

    if (currSelected)
        return <>
            <Editor key={currSelected} clipName={currSelected} onBack={() => setCurrSelected(null)}>
                <EditorVideo />
                <EditorMainBar>
                    <EditorCutHighlight bg='editor.highlight' opacity={.5} />
                    <EditorSeekBar />
                    <EditorStartBar
                        bg='editor.highlight'
                        cursor='pointer'
                        h='100%'
                    />
                    <EditorEndBar
                        bg='editor.highlight'
                        cursor='pointer'
                        h='100%'
                    />
                </EditorMainBar>
                <EditorTimelineTop />
            </Editor>
            <TitleBarItem>
                <Button
                    leftIcon={<FaArrowLeft />}
                    onClick={() => setCurrSelected(null)}
                    variant='solid'
                    colorScheme='red'
                >
                    Back
                </Button>
            </TitleBarItem>
        </>

    const clipElements = currVideos.map(({ thumbnail, info, videoName }, i) => {
        const { id, name, aliases, icon } = info ?? {}

        const gameName = name ?? aliases?.[0] ?? "Unknown Game"
        const imageSrc = `${RenderGlobals.baseUrl}/api/game/image?id=${id ?? "null"}&icon=${icon ?? "null"}`
        return <VideoGridItem key={`${i}-videoElements`}
            background={`url(${thumbnail})`}
            onClick={() => setCurrSelected(videoName)}
        >
            <Flex
                flex='1'
                w='100%'
                h='100%'
                justifyContent='center'
                alignItems='center'
            />
            <Flex
                flex='0'
                gap='.25em'
                justifyContent='center'
                alignItems='center'
                flexDir='column'
                bg='brand.bg'
                p='1'
            >
                <Flex gap='1em' justifyContent='center' alignItems='center'>
                    <Image src={imageSrc} w="1.5em" />
                    <Text>{gameName}</Text>
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
    })

    return <VideoGrid>
        {loading ? <Spinner /> : [...additionalElements, ...clipElements]}
    </VideoGrid>
}
