import { Clip } from '@backend/managers/clip/interface';
import { Flex, Grid, GridItem, Image, Spinner, Text } from '@chakra-ui/react';
import { RenderGlobals } from '@Globals/renderGlobals';
import React, { useEffect } from "react";
import { RenderLogger } from 'src/interfaces/renderLogger';
import Editor from './editor';

const log = RenderLogger.get("obs", "clips")
export default function Clips() {
    const [currClips, setClips] = React.useState<Clip[]>([])
    const [currSelected, setCurrSelected] = React.useState<string | null>("2022-06-11 20-08-47.mkv")
    const [ loading, setLoading ] = React.useState(false)
    const { clips } = window.api

    useEffect(() => {
        setLoading(true)
        clips.list()
            .then(e => {
                setClips(e)
                setLoading(false)
            })
    }, [])

    if(currSelected)
        return <Editor clipName={currSelected} onBack={() => setCurrSelected(null)}/>

    const clipElements = [...currClips, ...currClips, ...currClips, ...currClips, ...currClips, ...currClips].map(({ thumbnail, info, clipName }, i) => {
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
        overflowY='auto'
        p='5'
    >
        {loading ? <Spinner /> : clipElements}
    </Grid>
}
