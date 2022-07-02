import { AllAudioDevices, AudioDevice } from '@backend/managers/obs/Scene/interfaces'
import { Box, Flex, FlexProps, Text } from '@chakra-ui/react'
import { ExpFilter } from '@general/ExpFilter'
import React, { useEffect, useState } from "react"
import GeneralSpinner from 'src/components/general/spinner/GeneralSpinner'

export default function Volmeter(props: FlexProps & { displayName?: boolean }) {
    const { audio } = window.api
    const [sources, setSources] = useState(undefined as string[])
    const [devices, setDevices] = useState(undefined as AllAudioDevices)
    const [percentages, setPercentages] = useState(new Map<string, number>())
    const { displayName } = props

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

    useEffect(() => {
        if (sources === undefined)
            return


        const filters = new Map<string, ExpFilter>()

        sources.forEach(e => filters.set(e, new ExpFilter(0, 0.2, 0.2)))
        return audio.onVolmeterChange((source, m) => {
            const avg = Math.abs(m.reduce((a, b) => a + b, 0) / m.length);
            const max = Math.min(1, avg / 60)

            const filter = filters.get(source)
            const newVal = filter.update(1 - max)

            percentages.set(source, newVal)
            setPercentages(new Map(percentages.entries()))
        })
    }, [sources])

    const displays = Array.from(percentages.entries()).map(([source, percentage]) => {
        const devName = findAudioDevice(source, devices) ?? { name:  "Getting name..." }
        return <Flex flexDir='column'>
            <Flex w='100%' h='100%'>
                <Text>{devName.name}</Text>
            </Flex>
            <Flex
                w='100%'
                h='1rem'
                bg='gray.500'
                justifyContent='start'
                alignItems='center'
                rounded='xl'
            >
                <Box
                    bg='green.300'
                    h='100%'
                    rounded='xl'
                    transition=".05s all linear"
                    style={{ width: percentage * 100 + "%"}}
                />
            </Flex>
        </Flex>
    })

    return <Flex
        {...props}>
        {sources ? displays : <GeneralSpinner loadingText='Obtaining audio inputs...'/>}
    </Flex>
}

type FindAudioDevicesReturn = undefined | { type: "desktop" | "microphone" } & AudioDevice

function findAudioDevice(id: string, audioDevices: AllAudioDevices): FindAudioDevicesReturn {
    const { desktop, microphones} = audioDevices ?? {}
    const deskFound = desktop.find(e => e.device_id === id)

    if(deskFound)
        return { type: "desktop", ...deskFound }

    const micFound = microphones.find(e => e.device_id === id)
    if(micFound)
        return { type: "microphone", ...micFound}

    return undefined
}