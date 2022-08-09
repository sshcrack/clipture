import { SessionData } from '@backend/managers/auth/interfaces';
import { OutCurrentType } from '@backend/managers/obs/core/interface';
import { Flex, Heading } from '@chakra-ui/react';
import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { NavBar } from 'src/components/general/NavBar';
import EmptyPlaceholder from 'src/components/general/placeholder/EmptyPlaceholder';
import GameInfo from 'src/components/obs/recording/GameInfo';
import PerformanceStatistics from 'src/components/obs/recording/PerformanceStats';
import ActiveVolmeter from 'src/components/obs/recording/Volmeter';
import Preview from 'src/components/obs/videos/preview';

export default function RecordPage({ data }: { data: SessionData }) {
    const { obs } = window.api
    const { t } = useTranslation("record")

    const [recording, setRecording] = useState(false)
    const [current, setCurrent] = useState(undefined as OutCurrentType)

    useEffect(() => {
        const recording = window.api.obs.isRecording()
        setRecording(recording)
        if (recording) {
            obs.getCurrent()
                .then(e => setCurrent(e))
        }

        return obs.onRecordChange(r => {
            setRecording(r)
            obs.getCurrent()
                .then(e => setCurrent(e))
        })
    }, [])

    const { game } = current ?? {}
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
            <Heading>{t("title")}</Heading>
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
                    <ActiveVolmeter
                        mt='5'
                        mb='5'
                        w='80%'
                        h='100%'
                        flex='0'
                        gap='1em'
                        flexDir='column'
                        displayName
                    />
                </Flex>
                {recording &&
                    <Flex
                        flex='0'
                        flexDir='column'
                        pr='3'
                        pl='4'
                        justifyContent='center'
                        alignItems='center'
                    >
                        <Heading size='xl'>Recording</Heading>
                        {!game && <GameInfo game={game} />}
                        <PerformanceStatistics />
                    </Flex>
                }
            </Flex>
        </Flex>
    </Flex>
}