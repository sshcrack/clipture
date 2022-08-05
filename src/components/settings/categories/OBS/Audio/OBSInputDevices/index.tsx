import { findAudioDevice } from '@backend/managers/obs/Scene/audio_tools';
import { AllAudioDevices, DefaultAudioDevice } from '@backend/managers/obs/Scene/interfaces';
import { Flex, List, useToast } from '@chakra-ui/react';
import * as React from "react";
import { useContext, useEffect, useState } from 'react';
import GeneralSpinner from 'src/components/general/spinner/GeneralSpinner';
import { SettingsSaveContext } from 'src/pages/main/subpages/settings/SettingsSaveProvider';
import InputListItem from './InputListItem';
import { FixedSources } from './interface';

export default function OBSInputDevices() {
    const { addSaveListener, addModified, removeModified, saving } = useContext(SettingsSaveContext)
    const [sources, setSources] = useState(undefined as FixedSources)
    const [originalSources, setOriginalSources] = useState(undefined as FixedSources)

    const [update, setUpdate] = useState(0)
    const [allDevices, setAllDevices] = useState(undefined as AllAudioDevices)
    const [defaultDevice, setDefaultDevice] = useState(undefined as DefaultAudioDevice)

    const { audio } = window.api
    const toast = useToast()
    useEffect(() => {
        const handleCatch = (title: string) => {
            return (e: any) => {
                toast({
                    title: title,
                    description: e.message ?? e.stack ?? e
                })

                setTimeout(() => {
                    setUpdate(Math.random())
                }, 1000)
            }
        }

        const activeCatch = handleCatch("Could not get active sources")
        const devCatch = handleCatch("Could not list devices")
        const defaultCatch = handleCatch("Could not get default devices")

        audio.activeSources()
            .then(e => {
                setSources([...e] as any)
                setOriginalSources([...e] as any)
            })
            .catch(e => activeCatch(e))

        audio.allDevices()
            .then(e => {
                setAllDevices(e)
            })
            .catch(e => devCatch(e))

        audio.deviceDefault()
            .then(e => {
                setDefaultDevice(e)
            })
            .catch(e => defaultCatch(e))
    }, [saving, update])

    useEffect(() => {
        if (!sources || !originalSources)
            return

        const rawSources = JSON.stringify(sources)
        const rawOriginal = JSON.stringify(originalSources)
        console.log(
            sources.map(e => findAudioDevice(e.device_id, allDevices) ?? e.device_id),
            originalSources.map(e => findAudioDevice(e.device_id, allDevices) ?? e.device_id),
            { depth: null })

        if (rawSources !== rawOriginal)
            addModified("audio_input_devices")
        else
            removeModified("audio_input_devices")
    }, [sources, originalSources])

    useEffect(() => {
        if (!sources)
            return

        return addSaveListener(async () => {
            await audio.setDevices(sources)
        })
    }, [sources])

    if (!sources || !originalSources || !allDevices || !defaultDevice)
        return <GeneralSpinner loadingText='Getting sources...' />


    const items = sources.map((e, i) => {
        return <InputListItem
            key={`sources-item-${e.device_id}`}
            allDevices={allDevices}
            defaultDevice={defaultDevice}
            currDev={e}
            onChange={dev => {
                const clone = [...sources]
                clone[i] = dev
                setSources([...clone] as any)
            }}
        />
    })


    return <Flex
        flexDir='column'
        w='70%'
        h='100%'
        justifyContent='space-evenly'
        alignItems='center'
    >
        <List
            display='flex'
            flexDir='column'
            justifyContent='start'
            alignItems='center'
            h='100%'
            w='100%'
            spacing='3'
            overflowY='auto'
            flex='1'
        >
            {items}
        </List>
    </Flex>
}