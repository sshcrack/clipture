import "src/pages/dashboard/scrollbar.css";

import { Video, ClipCutInfo } from '@backend/managers/clip/interface';
import { Progress } from '@backend/processors/events/interface';
import { Flex, Grid, GridItem, Image, Spinner, Text, useToast } from '@chakra-ui/react';
import { RenderGlobals } from '@Globals/renderGlobals';
import React, { useEffect, useState } from "react";
import { RenderLogger } from 'src/interfaces/renderLogger';
import Editor from './editor';
import GradientLoader from './gradientLoader';

const log = RenderLogger.get("obs", "clips")
type ClipInfoArray = [ClipCutInfo, Progress]

export default function Videos() {
    const toast = useToast()
    const [retry, setRetry] = useState(0)
    const [currVideos, setVideos] = React.useState<Video[]>([])
    const [currSelected, setCurrSelected] = React.useState<string | null>(null)
    const [loading, setLoading] = React.useState(false)

    const [clipsProg, setClipsProg] = useState<ClipInfoArray[]>([])
    const [update, setUpdate] = useState(0)
    useEffect(() => {
        const { clips } = window.api
        clips.currently_cutting()
            .then(e => setClipsProg(e))
    }, [update])

    useEffect(() => {
        const { clips } = window.api

        clips.currently_cutting().then(e => setClipsProg(e))
        return clips.add_listener(() => setUpdate(Math.random()))
    }, [])

    const { videos } = window.api
    useEffect(() => {
        log.debug("Starting loading clips")
        setLoading(true)
        videos.list()
            .then(e => {
                setVideos(e)
                log.debug("Total of", e.length, "videos loaded")
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
        return <Editor key={currSelected} clipName={currSelected} onBack={() => setCurrSelected(null)} />

    const clipElements = [
        ...clipsProg.map(([clip, prog]) => ({
            isClip: true,
            info: null,
            thumbnail: null,
            ...clip,
            progress: prog
        })),
        ...currVideos.map(e => ({
            isClip: false,
            ...e,
            progress: null
        })),
    ].map(({ thumbnail, info, videoName, isClip, progress }, i) => {
        const { id, name, aliases, icon } = info ?? {}

        const gameName = name ?? aliases?.[0] ?? "Unknown Game"
        const imageSrc = `${RenderGlobals.baseUrl}/api/game/image?id=${id ?? "null"}&icon=${icon ?? "null"}`
        return <GridItem key={`${i}-clipElements`}
            display='flex'
            h='25em'
            w='100%'
            background={isClip ? "#000" : `url(${thumbnail})`}
            backgroundSize='cover'
            backgroundPosition='center'
            borderRadius="xl"
            flexDir='column'
            cursor='pointer'
            _hover={{
                filter: " drop-shadow(10px 2px 45px black)",
                transform: "scale(1.0125)"
            }}
            style={{
                transition: "all .2s ease-out"
            }}
            onClick={() => !isClip && setCurrSelected(videoName)}
        >
            <Flex
                flex='1'
                w='100%'
                h='100%'
                justifyContent='center'
                alignItems='center'
            >
                {isClip ? <Grid>
                    <Flex w='15em' h='15em' gridRow='1' gridColumn='1'>
                        <GradientLoader
                            percent={progress.percent}
                            size='15em'
                            gradient={["var(--chakra-colors-brand-primary)", "var(--chakra-colors-brand-secondary)", "var(--chakra-colors-brand-secondary)"]}
                        />
                    </Flex>
                    <Flex
                        w='15em'
                        h='15em'
                        p='1em'
                        justifyContent='center'
                        alignItems='center'
                        gridRow='1'
                        gridColumn='1'
                        zIndex='10'
                        flexDir='column'
                    >
                        <Text color='var(--chakra-colors-brand-secondary)' fontSize='2em'>Cutting...</Text>
                        <Text color='var(--chakra-colors-brand-secondary)' fontSize='2em'>{Math.round(progress.percent * 100)}%</Text>
                    </Flex>
                </Grid> : null}
            </Flex>
            <Flex
                flex='0'
                gap='.25em'
                justifyContent='center'
                alignItems='center'
                flexDir='column'
                backdropFilter="blur(4px)"
                p='1'
            >
                {isClip ? null : <Flex gap='1em' justifyContent='center' alignItems='center'>
                    <Image src={imageSrc} w="1.5em" />
                    <Text>{gameName}</Text>
                </Flex>}
                <Text style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "90%",
                    textAlign: "center"
                }}>{videoName}</Text>
            </Flex>
        </GridItem>
    })

    return <Grid
        justifyContent='start'
        alignItems='start'
        w='100%'
        gap='1em'
        templateColumns='repeat(auto-fill, minmax(21.5em,1fr))'
        className='sc2'
        overflowY='auto'
        p='5'
        pr='2'
        mr='4'
    >
        {loading ? <Spinner /> : clipElements}
    </Grid>
}
