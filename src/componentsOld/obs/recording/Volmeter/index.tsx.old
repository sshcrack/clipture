import { findAudioDevice } from '@backend/managers/obs/Scene/audio_tools'
import { AllAudioDevices, DefaultAudioDevice } from '@backend/managers/obs/Scene/interfaces'
import { Flex, FlexProps, Text } from '@chakra-ui/react'
import React, { useEffect, useState } from "react"
import { useTranslation } from 'react-i18next'
import GeneralSpinner from 'src/componentsOld/general/spinner/GeneralSpinner'
import { FixedSources } from 'src/componentsOld/settings/categories/OBS/Audio/OBSInputDevices/interface'
import Volmeter from './Volmeter'

export default function ActiveVolmeter({ displayName, ...props }: FlexProps & { displayName?: boolean }) {
    const { audio } = window.api
    const { t } = useTranslation("obs", { keyPrefix: "recording.volmeter" })

    const [sources, setSources] = useState(undefined as FixedSources)
    const [devices, setDevices] = useState(undefined as AllAudioDevices)
    const [defaultDev, setDefaultDev] = useState(undefined as DefaultAudioDevice)

    useEffect(() => {
        audio.allDevices().then(dev => setDevices(dev))
        audio.activeSources()
            .then(s => setSources(s))

        audio.deviceDefault()
            .then(e => setDefaultDev(e))

        return audio.onDeviceUpdate(e => setDevices(e))
    }, [])

    console.log("Device update to", devices, "sources", sources)
    if (!sources)
        return <Flex {...props}>
            <GeneralSpinner loadingText={t("loading")} />
        </Flex>

    const displays = sources.map(({ device_id, type }) => {
        let devName = findAudioDevice(device_id, devices)?.name
        let volSource = device_id
        if (device_id?.toLowerCase() === "default") {
            if (type === "microphone") {
                devName = t("default_mic")
                volSource = defaultDev.microphone.device_id
            }
            else {
                devName = t("default_desktop")
                volSource = defaultDev.desktop.device_id
            }
        }

        if (device_id?.toLowerCase() === "disable") {
            devName = `[${t("disabled")}]`
            volSource = null
        }

        return <Flex flexDir='column' key={volSource + "-volmeter"}>
            {displayName && <Flex w='100%' h='100%'>
                <Text>{devName ?? `[${t("not_connected")}]`}</Text>
            </Flex>}
            <Volmeter source={volSource} />
        </Flex>
    })

    return <Flex
        {...props}>
        {displays}
    </Flex>
}
