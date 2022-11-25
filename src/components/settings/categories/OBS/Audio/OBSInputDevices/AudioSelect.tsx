import { AudioDevice, DeviceType } from '@backend/managers/obs/Scene/interfaces';
import { Button, Flex, Select } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import Volmeter from 'src/components/obs/recording/Volmeter/Volmeter';
import { SourceInfo } from './interface';

type Props = {
    devices: AudioDevice[],
    onAdd: (source: SourceInfo) => void,
    defaultDev: AudioDevice,
    type: DeviceType
}
export default function AudioSelect({ devices, onAdd, defaultDev, type }: Props) {
    const [currSelected, setCurrSelected] = useState(devices[0] as AudioDevice)
    const ref = useRef<HTMLSelectElement>(null)
    const { t } = useTranslation("settings", { keyPrefix: "select.audio_select" })

    useEffect(() => {
        if (!ref.current)
            return

        ref.current.selectedIndex = 1
    }, [ref])

    const selectOptions = devices
        .map(e => {
            return <option key={`audio-select-option-${e.name}`} value={e.device_id}>{e.name}</option>
        })

    const curr = currSelected.device_id
    const volmeterSource = curr.toLowerCase() === "default" ? defaultDev.device_id : curr

    return <Flex
        flexDir='column'
        gap='3'
    >
        <Flex
            gap='3'
        >
            <Select
                ref={ref}
                placeholder={t("placeholder")}
                onChange={e => {
                    const temp = e.target.selectedIndex
                    const currIndex = temp === 0 ? 1 : temp

                    setCurrSelected(devices[currIndex - 1])
                    ref.current.selectedIndex = currIndex
                }}>
                {selectOptions}
            </Select>
        </Flex>
        {currSelected && <Volmeter source={volmeterSource} />}
        <Button
            onClick={() => onAdd({
                device_id: currSelected.device_id,
                volume: 1,
                type
            })}
        >{t("add")}</Button>
    </Flex>
}