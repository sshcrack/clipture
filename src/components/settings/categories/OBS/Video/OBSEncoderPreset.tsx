import { Encoder } from '@backend/managers/obs/types'
import { Flex, Select, Text, useToast } from '@chakra-ui/react'
import React, { useState, useContext, useEffect } from "react"
import { useTranslation } from 'react-i18next'
import GeneralSpinner from 'src/components/general/spinner/GeneralSpinner'
import { SettingsSaveContext } from 'src/pages/main/subpages/settings/SettingsSaveProvider'

export default function OBSEncoderPreset() {
    const { t } = useTranslation("settings", { keyPrefix: "obs.video.encoder_preset" })

    const { addSaveListener, addModified, removeModified, saving } = useContext(SettingsSaveContext)
    const [availableEncoders, setAvailableEncoders] = useState(undefined as Encoder[])
    const [availablePresets, setAvailablePresets] = useState(undefined as string[])
    const [currEncoder, setEncoder] = useState(undefined as Encoder)
    const [originalEncoder, setOriginalEncoder] = useState(undefined as Encoder)
    const [currPreset, setPreset] = useState(undefined as string)
    const [originalPreset, setOriginalPreset] = useState(undefined as string)

    const { obs } = window.api
    const toast = useToast()

    useEffect(() => {
        obs.getEncoder()
            .then(e => setAvailableEncoders(e))

        obs.getRec()
            .then(({ encoder, preset }) => {
                setEncoder(encoder)
                setOriginalEncoder(encoder)
                setPreset(preset)
                setOriginalPreset(preset)
                obs.getPresets(encoder)
                    .then(e => setAvailablePresets(e))
            })
    }, [saving])


    useEffect(() => {
        return addSaveListener(async () => {
            await obs.setRec({ encoder: currEncoder, preset: currPreset })
        })
    }, [addSaveListener, currEncoder, currPreset])

    if(availableEncoders === undefined || currPreset === undefined)
        return <GeneralSpinner loadingText={t("loading_encoders")} />

    if(availableEncoders === null)
        return <GeneralSpinner loadingText={t("no_encoders")} />

    if (currPreset === null)
        return <GeneralSpinner loadingText={t("no_curr_preset")} />

    const encoderOption = availableEncoders.map(e => (
        <option key={e} value={e}>{e}</option>
    ))

    const presetOptions = availablePresets && availablePresets.map(e => (
        <option key={e} value={e}>{e}</option>
    ))

    const getPresets = (encoder: Encoder, checkValid: boolean) => obs.getPresets(encoder)
            .then(e => {
                setAvailablePresets(e)
                if(checkValid && e.length > 0)
                    setPreset(e[0])
            })
            .catch(() => toast({ status: "error", title: "could not load presets for encoder" }))

    return <Flex
        flexDir='column'
        w='70%'
        justifyContent='center'
        alignItems='center'
    >
        <Text alignSelf='start' mb='8px'>{t("encoder")}</Text>
        <Select value={currEncoder} onChange={e => {
            const newEnc = e.target.value as Encoder
            getPresets(newEnc, true)
            setEncoder(newEnc)
            if (newEnc !== originalEncoder)
                addModified("obs_encoder_preset")
            else
                removeModified("obs_encoder_preset")
        }}>
            {encoderOption}
        </Select>

        <Flex h='1.5em' />
        <Text alignSelf='start' mb='8px'>{t("preset")}</Text>
        {!availablePresets ? <GeneralSpinner loadingText={t("loading_presets")} /> :
            <Select value={currPreset} onChange={e => {
                const newPreset = e.target.value
                setPreset(newPreset)

                if (originalPreset !== newPreset)
                    addModified("obs_encoder_preset")
                else
                    removeModified("obs_encoder_preset")
            }}>
                {presetOptions}
            </Select>
        }
    </Flex>
}