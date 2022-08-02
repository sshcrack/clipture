import { findAudioDevice } from '@backend/managers/obs/Scene/audio_tools'
import { AllAudioDevices } from '@backend/managers/obs/Scene/interfaces'
import { Flex, FlexProps, Text } from '@chakra-ui/react'
import { ExpFilter } from '@general/ExpFilter'
import React, { useEffect, useState } from "react"
import GeneralSpinner from 'src/components/general/spinner/GeneralSpinner'
import Volmeter from './Volmeter'

export default function ActiveVolmeter({ displayName, ...props }: FlexProps & { displayName?: boolean }) {
    const { audio } = window.api
    const [sources, setSources] = useState(undefined as string[])
    const [devices, setDevices] = useState(undefined as AllAudioDevices)

    useEffect(() => {
        console.log("Getting audio devices...")
        audio.allDevices().then(dev => setDevices(dev))

        console.log("Getting sources...")
        audio.activeSources()
            .then(s => {
                setSources(s)
                console.log("Setting sources")
            })
    }, [])

    if (!sources)
        return <Flex {...props}>
            <GeneralSpinner loadingText='Obtaining audio inputs...' />
        </Flex>

    const displays = sources.map(source => {
        const devName = findAudioDevice(source, devices) ?? { name: "Getting name..." }
        return <Flex flexDir='column' key={source + "-volmeter"}>
            {displayName && <Flex w='100%' h='100%'>
                <Text>{devName.name}</Text>
            </Flex>}
            <Volmeter source={source} />
        </Flex>
    })

    return <Flex
        {...props}>
        {displays}
    </Flex>
}