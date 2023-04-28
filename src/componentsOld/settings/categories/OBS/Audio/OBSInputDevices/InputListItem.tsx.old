import { AllAudioDevices, DefaultAudioDevice, DeviceType } from '@backend/managers/obs/Scene/interfaces'
import { Flex, Grid, ListItem, Select, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text } from '@chakra-ui/react'
import React, { useEffect, useRef } from "react"
import { useTranslation } from 'react-i18next'
import Volmeter from 'src/componentsOld/obs/recording/Volmeter/Volmeter'
import { SourceInfo } from './interface'

type Props = {
    currDev: SourceInfo,
    allDevices: AllAudioDevices,
    defaultDevice: DefaultAudioDevice,
    onChange: (source: SourceInfo) => void,
}

interface OptionValue {
    device_id: string,
    name: string,
    type: DeviceType,
    disabled?: boolean
}

export default function InputListItem({ currDev: currDev, allDevices, defaultDevice, onChange }: Props) {
    const { device_id, type } = currDev
    const { t } = useTranslation("settings", { keyPrefix: "obs.audio" })

    const ref = useRef<HTMLSelectElement>(null)


    let findId = device_id
    const volume = currDev.volume
    if (findId?.toLowerCase() === "default")
        findId = `default-${type}`

    let volSource = device_id
    if (device_id?.toLowerCase() === "default") {
        if (type === "microphone")
            volSource = defaultDevice.microphone.device_id
        else
            volSource = defaultDevice.desktop.device_id
    }

    const notAvailableDesktop = type === "desktop" && !allDevices.desktop.some(e => e.device_id === device_id)
    const notAvailableMicrophone = type === "microphone" && !allDevices.microphones.some(e => e.device_id === device_id)

    const optionValues = [
        {
            device_id: null,
            name: t("device.desktop"),
            type: null,
            disabled: true
        },
        ...allDevices.desktop.map(({ device_id, name }) => ({
            device_id,
            name: device_id.toLowerCase() === "default" ? t("device.default_desktop") : name,
            type: "desktop"
        })),
        notAvailableDesktop ? {
            device_id: device_id,
            type: "desktop",
            name: `[${t("device.not_connected")}]`,
            disabled: true
        } : {
            device_id: "disable",
            type: "desktop",
            name: `[${t("device.disabled")}]`,
        },
        {
            device_id: null,
            name: t("device.microphone"),
            type: null,
            disabled: true
        },
        notAvailableMicrophone ? {
            device_id: device_id,
            type: "microphone",
            name: `[${t("device.not_connected")}]`,
            disabled: true
        } : {
            device_id: "disable",
            type: "microphone",
            name: `[${t("device.disabled")}]`,
        },
        ...allDevices.microphones.map(({ device_id, name }) => ({
            device_id,
            name: device_id.toLowerCase() === "default" ? t("device.default_mic") : name,
            type: "microphone"
        }))
    ] as OptionValue[]

    const options = optionValues.map(({ name, device_id, type, disabled }, i) => {
        let value = device_id
        const lowerCase = device_id?.toLowerCase()
        if (lowerCase === "default")
            value = `default-${type}`

        return <option
            key={`device-select-${device_id}-${name}-${i}`}
            value={value}
            disabled={disabled ?? false}
        >{name}</option>
    })

    useEffect(() => {
        if (!ref.current)
            return

        const index = options.findIndex(e => e.props["value"] === findId)
        if (index === -1)
            return

        ref.current.selectedIndex = index
    }, [ref, options, optionValues, findId])


    return <ListItem
        display='flex'
        rounded='md'
        w='100%'
        flexDir='column'
        p='2'
        _hover={{ background: "var(--chakra-colors-gray-700)" }}
        transition={'.1s ease-in-out all'}
        gap='3'
    >
        <Flex
            w='100%'
            alignItems='center'
            justifyContent='space-around'
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
                    if (invalid)
                        curr.selectedIndex = otherValid

                    onChange({
                        device_id: finalInfo.device_id,
                        type: finalInfo.type,
                        volume
                    })
                }}
            >
                {options}
            </Select>
            <Volmeter flex='0.25' source={volSource} />
        </Flex>
        <Flex
            w='100%'
            alignItems='center'
            justifyContent='space-around'
        >
            <Text flex='.5'>{t("volume")}</Text>
            <Flex flex='.25' gap='3'>
                <Grid
                    flex='0'
                    templateColumns='auto'
                    templateRows='auto'
                >
                    <Text gridRow='1' gridColumn='1' opacity='0'>999.9%</Text>
                    <Text gridRow='1' gridColumn='1'>{(volume * 100).toFixed(0)}%</Text>
                </Grid>
                <Slider
                    w='100%'
                    flex='1'
                    aria-label='Device Volume'
                    value={volume}
                    max={1}
                    step={0.01}
                    min={-1}
                    onChange={e => {
                        onChange({
                            ...currDev,
                            volume: e
                        })
                    }}
                >
                    <SliderTrack>
                        <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                </Slider>
            </Flex>

        </Flex>
    </ListItem>
}