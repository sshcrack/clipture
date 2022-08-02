import { findAudioDevice } from '@backend/managers/obs/Scene/audio_tools';
import { AllAudioDevices, AudioDevice, DefaultAudioDevice } from '@backend/managers/obs/Scene/interfaces';
import { Box, Button, CloseButton, Flex, List, ListItem, Select, Text, Tooltip, useToast } from '@chakra-ui/react';
import * as React from "react";
import { useContext, useEffect, useState } from 'react';
import GeneralSpinner from 'src/components/general/spinner/GeneralSpinner';
import Volmeter from 'src/components/obs/recording/Volmeter/Volmeter';
import { SettingsSaveContext } from 'src/pages/main/subpages/settings/SettingsSaveProvider';
import AudioSelect from './AudioSelect';

export default function OBSInputDevices() {
    const { addSaveListener, addModified, removeModified, saving } = useContext(SettingsSaveContext)
    const [sources, setSources] = useState(undefined as string[])
    const [update, setUpdate] = useState(0)
    const [originalSources, setOriginalSources] = useState(undefined as string[])
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
                setSources(e)
                setOriginalSources(e)
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

    if (!sources || !originalSources || !allDevices || !defaultDevice)
        return <GeneralSpinner loadingText='Getting sources...' />

    const items = sources.map(e => {
        const { name } = findAudioDevice(e, allDevices) ?? {}
        return <ListItem
            key={`sources-item-${e}`}
            display='flex'
            alignItems='center'
            flexDir='row'
            w='100%'
        >
            <Text w='100%'>{name}</Text>
            <Volmeter source={e} />
            <Tooltip label='Remove source'>
                <CloseButton
                    size='md'
                />
            </Tooltip>
        </ListItem>
    })



    return <Flex
        flexDir='column'
        w='70%'
    >
        <List
            display='flex'
            flexDir='column'
            justifyContent='start'
            alignItems='center'
            spacing='3'
        >
            {items}
        </List>
        <Box h='10rem' />
        <Text>Microphone</Text>
        <AudioSelect
            devices={allDevices.microphones}
            defaultDev={defaultDevice.microphone}
            onAdd={e => alert(`Added ${JSON.stringify(e)}`)}
        />
        <Box h='10rem' />
        <Text>Desktop</Text>
        <AudioSelect
            devices={allDevices.desktop}
            defaultDev={defaultDevice.desktop}
            onAdd={e => alert(`Added ${JSON.stringify(e)}`)}
        />
    </Flex>
}