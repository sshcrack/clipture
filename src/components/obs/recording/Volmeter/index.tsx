import { findAudioDevice } from '@backend/managers/obs/Scene/audio_tools'
import { AllAudioDevices, DefaultAudioDevice } from '@backend/managers/obs/Scene/interfaces'
import { Flex, FlexProps, Text } from '@chakra-ui/react'
import React, { useEffect, useState } from "react"
import GeneralSpinner from 'src/components/general/spinner/GeneralSpinner'
import { FixedSources } from 'src/components/settings/categories/OBS/Audio/OBSInputDevices/interface'
import Volmeter from './Volmeter'

export default function ActiveVolmeter({ displayName, ...props }: FlexProps & { displayName?: boolean }) {
    const { audio } = window.api
    const [sources, setSources] = useState(undefined as FixedSources)
    const [devices, setDevices] = useState(undefined as AllAudioDevices)
    const [defaultDev, setDefaultDev] = useState(undefined as DefaultAudioDevice)

    useEffect(() => {
        console.log("Getting audio devices...")
        audio.allDevices().then(dev => setDevices(dev))

        console.log("Getting sources...")
        audio.activeSources()
            .then(s => {
                setSources(s)
                console.log("Setting sources")
            })

        audio.deviceDefault()
            .then(e => setDefaultDev(e))
    }, [])

    if (!sources)
        return <Flex {...props}>
            <GeneralSpinner loadingText='Obtaining audio inputs...' />
        </Flex>

    const displays = sources.map(({ device_id, type }) => {
        let devName = findAudioDevice(device_id, devices)?.name
        let volSource = device_id
        if (device_id.toLowerCase() === "default") {
            if (type === "microphone") {
                devName = "Default Microphone"
                volSource = defaultDev.microphone.device_id
            }
            else {
                devName = "Default Desktop"
                volSource = defaultDev.desktop.device_id
            }
        }

        return <Flex flexDir='column' key={volSource + "-volmeter"}>
            {displayName && <Flex w='100%' h='100%'>
                <Text>{devName}</Text>
            </Flex>}
            <Volmeter source={volSource} />
        </Flex>
    })

    return <Flex
        {...props}>
        {displays}
    </Flex>
}