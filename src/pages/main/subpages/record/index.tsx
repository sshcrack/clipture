import { SessionData } from '@backend/managers/auth/interfaces';
import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from "react";
import { NavBar } from 'src/components/general/NavBar';
import EmptyPlaceholder from 'src/components/general/placeholder/EmptyPlaceholder';
import PerformanceStatistics from 'src/components/obs/recording/PerformanceStats';
import Volmeter from 'src/components/obs/recording/Volmeter';
import Preview from 'src/components/obs/videos/preview';

export default function RecordPage({ data }: { data: SessionData }) {
    const { obs } = window.api
    const [recording, setRecording] = useState(() => window.api.obs.isRecording())
    const [recordDesc, setRecordDesc] = useState("Unknown")

    useEffect(() => {
        return obs.onRecordChange(r => {
            setRecording(r)
            setRecordDesc(obs.recordDescription())
        })
    }, [])


    console.log("Rerender record")
    return <Flex
        w='100%'
        h='100%'
    >
        <NavBar
            data={data}
            w='5em'
            h='100%'
        />
        <Flex
            w='100%'
            h='100%'
            flexDir='column'
            justifyContent='start'
            alignItems='center'
        >
            <Heading>Recording Overview</Heading>
            <Flex
                w='100%'
                flex='1'
                h='100%'
                justifyContent='center'
                alignItems='center'
                flexDir='row'
            >
                <Flex
                    w='100%'
                    h='100%'
                    justifyContent='center'
                    alignItems='center'
                    flexDir='column'
                    flex='1'
                >
                    <Flex
                        w='100%'
                        h='100%'
                        justifyContent='center'
                        alignItems='center'
                        pl='4'
                    >
                        {
                        recording ?
                        <Preview /> :
                        <EmptyPlaceholder />
                    }
                    </Flex>
                    <Volmeter
                        mt='5'
                        mb='5'
                        w='80%'
                        h='100%'
                        flex='0'
                        gap='1em'
                        flexDir='column'
                    />
                </Flex>
                <Flex
                    flex='0'
                    flexDir='column'
                    pr='3'
                    pl='4'
                    justifyContent='center'
                    alignItems='center'
                >
                    <Heading size='xl'>{recording ? "Recording" : ""}</Heading>
                    {recording && <PerformanceStatistics />}
                </Flex>
            </Flex>
        </Flex>
    </Flex>
}