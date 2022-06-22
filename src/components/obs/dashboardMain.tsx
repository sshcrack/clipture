import { SessionData } from '@backend/managers/auth/interfaces';
import { ClipCutInfo } from '@backend/managers/clip/interface';
import { Progress } from '@backend/processors/events/interface';
import { Flex, Heading, Progress as ChakraProgress, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import Clips from './clips';
import { NavBar } from './NavBar/';

type ClipInfoArray = [ClipCutInfo, Progress]

export function DashboardMain({ data }: { data: SessionData }) {
    const [clipsProg, setClipsProg] = useState<ClipInfoArray[]>([[{ clipName: "Test.mkv", start: 0, end: 10 }, { percent: 0.5, status: "Cutting clip..." }], [{ clipName: "Test.mkv", start: 0, end: 10 }, { percent: 0.5, status: "Cutting clip..." }]])
    const [update, setUpdate] = useState(0)
    /*useEffect(() => {
        const { clips } = window.api
        clips.currently_cutting()
            .then(e => setClipsProg(e))
    }, [update])

    useEffect(() => {
        const { clips } = window.api

        clips.currently_cutting().then(e => setClipsProg(e))
        return clips.add_listener(() => setUpdate(Math.random()))
    }, [])*/

    return <Flex
        gap={4}
        flexDir='row'

        width='100%'
        height='100%'
    >
        <Flex
            w='15em'
            h='100%'
        >
            <NavBar data={data} />
        </Flex>
        <Flex
            flexDir='column'
            alignItems='center'
            w='100%'
            h='100%'
        >
            <Heading>Clips</Heading>
            <Flex
                flexDir='column'
                alignItems='center'
                w='100%'
                h='100%'
            >
                <Clips />
            </Flex>
            <Flex
                w='80%'
                flexDir="column"
                justifyContent='center'
                alignItems='center'
            >
                {
                    clipsProg.map(([clip, progress]) => (
                        <Flex
                            key={clip.clipName} w='100%'
                            justifyContent='center'
                            alignItems='center'
                        >
                            <Text mr='10'>{clip.clipName}</Text>
                            <ChakraProgress
                                w='100%'
                                value={progress.percent}
                                max={1}
                                rounded='md'
                                transitionProperty='width !important'
                            />
                        </Flex>
                    ))
                }
            </Flex>
        </Flex>
    </Flex>
}