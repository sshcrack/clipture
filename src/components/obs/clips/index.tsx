import "src/pages/dashboard/scrollbar.css"

import { Clip } from '@backend/managers/clip/interface';
import { Flex, Grid, GridItem, Image, Spinner, Text, useToast } from '@chakra-ui/react';
import { RenderGlobals } from '@Globals/renderGlobals';
import React, { useEffect, useState } from "react";
import { RenderLogger } from 'src/interfaces/renderLogger';
import Editor from './editor';

const log = RenderLogger.get("obs", "clips")
export default function Clips() {
    const toast = useToast()
    const [retry, setRetry] = useState(0)
    const [currClips, setClips] = React.useState<Clip[]>([])
    const [currSelected, setCurrSelected] = React.useState<string | null>("2022-06-11 20-08-47.mkv")
    const [loading, setLoading] = React.useState(false)
    const { clips } = window.api

    useEffect(() => {
        log.debug("Starting loading clips")
        setLoading(true)
        clips.list()
            .then(e => {
                setClips([...e, ...e, ...e, ...e, ...e, ...e, ...e, ...e])
                log.debug("Total of", e.length, "clips loaded")
                setLoading(false)
            })
            .catch(e => {
                log.error(e)
                toast({
                    title: "Could not list clips",
                    description: `${e.message}. Retrying in 5 seconds`,
                })
                setTimeout(() => setRetry(Math.random()))
            })
    }, [retry])

    if (currSelected)
        return <Editor key={currSelected} clipName={currSelected} onBack={() => setCurrSelected(null)} />

    const clipElements = currClips.map(({ thumbnail, info, clipName }, i) => {
        const { id, name, aliases, icon } = info ?? {}

        const gameName = name ?? aliases?.[0] ?? "Unknown Game"
        const imageSrc = `${RenderGlobals.baseUrl}/api/game/image?id=${id ?? "null"}&icon=${icon ?? "null"}`
        return <GridItem key={`${i}-clipElements`}
            display='flex'
            h='25em'
            w='100%'
            backgroundImage={thumbnail}
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
            onClick={() => setCurrSelected(clipName)}
        >
            <Flex flex='1' w='100%' h='100%' />
            <Flex
                flex='0'
                gap='.25em'
                justifyContent='center'
                alignItems='center'
                flexDir='column'
                backdropFilter="blur(4px)"
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
                }}>{clipName}</Text>
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
