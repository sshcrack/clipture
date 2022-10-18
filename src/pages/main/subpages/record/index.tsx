import { SessionData } from '@backend/managers/auth/interfaces';
import { OutCurrentType } from '@backend/managers/obs/core/interface';
import { Button, Flex, Heading, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import NavBar from 'src/components/general/NavBar';
import EmptyPlaceholder from 'src/components/general/placeholder/EmptyPlaceholder';
import GameInfo from 'src/components/obs/recording/GameInfo';
import PerformanceStatistics from 'src/components/obs/recording/PerformanceStats';
import ActiveVolmeter from 'src/components/obs/recording/Volmeter';
import Preview from 'src/components/obs/videos/preview';
import RefreshGamesBtn from './RefreshGames';
import SwitchMonitorBtn from './SwitchMonitorBtn';

export default function RecordPage({ data }: { data: SessionData }) {
    const { obs } = window.api
    const { t } = useTranslation("record")

    const [recording, setRecording] = useState(false)
    const [automaticRecord, setAutomaticRecord] = useState<boolean>(null)
    const [isSaving, setSaving] = useState(false)
    const [current, setCurrent] = useState(undefined as OutCurrentType)
    const toast = useToast()

    useEffect(() => {
        const recording = window.api.obs.isRecording()
        setRecording(recording)
        if (recording) {
            obs.getCurrent()
                .then(e => setCurrent(e))
        }

        obs.isAutoRecord()
            .then(e => setAutomaticRecord(e))

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
                    gap='5'
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
                    <Flex
                        w='80%'
                        justifyContent='space-around'
                        alignItems='center'
                    >
                        <Button
                            colorScheme={recording ? "red" : "green"}
                            isLoading={isSaving}
                            loadingText={"Saving..."}
                            onClick={() => {
                                const prom = recording ? obs.stopRecording() : obs.automaticRecord(false)
                                    .then(async () => {
                                        setAutomaticRecord(false)
                                        await obs.startRecording()
                                        await obs.switchDesktop(1)
                                    })

                                setSaving(true)
                                prom
                                    .catch(e => {
                                        console.error(e)
                                        toast({
                                            colorScheme: "error",
                                            description: e,
                                            title: "Error"
                                        })
                                    })
                                    .finally(() => setSaving(false))
                            }
                            }
                        >{recording ? t("stop") : t("start")}</Button>
                        {!recording && <RefreshGamesBtn automaticRecord={automaticRecord} />}
                        {recording && automaticRecord === false && <SwitchMonitorBtn />}
                        <Button
                            colorScheme={automaticRecord ? "red" : "green"}
                            isLoading={isSaving}
                            loadingText={"Saving..."}
                            disabled={automaticRecord === null}
                            onClick={() => {
                                setSaving(true)
                                obs.automaticRecord(!automaticRecord)
                                    .then(() => setAutomaticRecord(!automaticRecord))
                                    .catch(e => {
                                        console.error(e)
                                        toast({
                                            status: "error",
                                            title: "Error",
                                            description: e?.message ?? e?.stack ?? e
                                        })
                                    })
                                    .finally(() => setSaving(false))
                            }}
                        >{automaticRecord ? t("automatic.disable") : t("automatic.enable")}</Button>
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
                        {!game && <GameInfo game={game} name={current?.videoName} />}
                        <PerformanceStatistics />
                    </Flex>
                }
            </Flex>
        </Flex>
    </Flex>
}