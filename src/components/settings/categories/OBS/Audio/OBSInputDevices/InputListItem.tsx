import { findAudioDevice } from '@backend/managers/obs/Scene/audio_tools'
import { AllAudioDevices, DefaultAudioDevice, DeviceType } from '@backend/managers/obs/Scene/interfaces'
import { CloseButton, ListItem, Select, Text, Tooltip } from '@chakra-ui/react'
import React, { useEffect, useRef } from "react"
import Volmeter from 'src/components/obs/recording/Volmeter/Volmeter'
import { SourceInfo } from './interface'

type Props = {
    currDev: SourceInfo,
    allDevices: AllAudioDevices,
    defaultDevice: DefaultAudioDevice,
    onChange: (source: SourceInfo) => void
}

interface OptionValue {
    device_id: string,
    name: string,
    type: DeviceType
}

export default function InputListItem({ currDev: currDev, allDevices, defaultDevice, onChange }: Props) {
    const { device_id, type } = currDev
    const ref = useRef<HTMLSelectElement>(null)


    let findId = device_id
    if (findId?.toLowerCase() === "default")
        findId = `default-${type}`

    let volSource = device_id
    if (device_id?.toLowerCase() === "default") {
        if (type === "microphone")
            volSource = defaultDevice.microphone.device_id
        else
            volSource = defaultDevice.desktop.device_id
    }

    const optionValues = [
        {
            device_id: null,
            name: "======Desktop======",
            type: null
        },
        ...allDevices.desktop.map(({ device_id, name }) => ({
            device_id,
            name: device_id.toLowerCase() === "default" ? "Default Desktop" : name,
            type: "desktop"
        })),
        {
            device_id: null,
            name: "======Microphone======",
            type: null
        },
        ...allDevices.microphones.map(({ device_id, name }) => ({
            device_id,
            name: device_id.toLowerCase() === "default" ? "Default Microphone" : name,
            type: "microphone"
        }))
    ] as OptionValue[]

    const options = optionValues.map(({ name, device_id, type }, i) => {
        let value = device_id
        const lowerCase = device_id?.toLowerCase()
        if (lowerCase === "default")
            value = `default-${type}`

        return <option key={`device-select-${device_id}-${name}-${i}`} value={value}>{name}</option>
    })

    useEffect(() => {
        if (!ref.current)
            return

        const index = options.findIndex(e => e.props["value"] === findId)
        if (index === -1)
            return

        //@ts-ignore
        window.options = options
        //@ts-ignore
        window.optionsValues = optionValues
        ref.current.selectedIndex = index
    }, [ref, options, optionValues, findId])

    return <ListItem
        display='flex'
        alignItems='center'
        flexDir='row'
        justifyContent='space-around'
        rounded='md'
        w='100%'
        p='2'
        _hover={{ background: "var(--chakra-colors-gray-700)" }}
        transition={'.1s ease-in-out all'}
    >
        <Select
            ref={ref}
            flex='.5'
            onInput={e => {
                const curr = e.currentTarget
                const info = optionValues[curr.selectedIndex]
                const otherValid = optionValues.findIndex(e => e.device_id !== null)
                const invalid = info.device_id === null && info.type === null

                const finalInfo = invalid ? optionValues[otherValid] : info
                if(invalid)
                    curr.selectedIndex = otherValid

                onChange({
                    device_id: finalInfo.device_id,
                    type: finalInfo.type
                })
            }}
        >
            {options}
        </Select>
        <Volmeter flex='0.25' source={volSource} />
    </ListItem>
}