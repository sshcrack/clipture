import { ERecordingQualityIncluded } from '@backend/managers/obs/types'
import { Flex, Select, Text } from '@chakra-ui/react'
import React, { useState, useContext, useEffect } from "react"
import { useTranslation } from 'react-i18next'
import { SettingsSaveContext } from 'src/pages/main/subpages/settings/SettingsSaveProvider'

export default function OBSSimpleQualitySelector() {
    const { t } = useTranslation("settings", { keyPrefix: "obs.video.simple_preset" })

    const { addSaveListener, addModified, removeModified, saving } = useContext(SettingsSaveContext)
    const [currPreset, setPreset] = useState(undefined as ERecordingQualityIncluded)
    const [originalPreset, setOriginalPreset] = useState(undefined as ERecordingQualityIncluded)

    const { obs } = window.api

    useEffect(() => {
        obs.getSettings()
            .then(({ simple_preset: preset }) => {
                setPreset(preset)
                setOriginalPreset(preset)
            })
    }, [saving])


    useEffect(() => {
        return addSaveListener(async () => {
            await obs.updateSettings({ simple_preset: currPreset })
        })
    }, [addSaveListener, currPreset])

    const availablePresets = Object.values(ERecordingQualityIncluded).filter(e => isNaN(e as unknown as number)) as string[]
    const presetOptions = availablePresets && availablePresets.map(e => (
        <option key={e} value={ERecordingQualityIncluded[e as any]}>{t(`presets.${e}` as any)}</option>
    ))

    return <Flex
        flexDir='column'
        w='70%'
        justifyContent='center'
        alignItems='center'
    >
        <Text alignSelf='start' mb='8px'>{t("preset")}</Text>
        <Select value={currPreset} onChange={e => {
            const newPreset = parseInt(e.target.value) as unknown as ERecordingQualityIncluded

            setPreset(newPreset)
            if (newPreset !== originalPreset)
                addModified("obs_encoder_preset")
            else
                removeModified("obs_encoder_preset")
        }}>
            {presetOptions}
        </Select>
    </Flex>
}