import { CaptureMethod } from '@backend/managers/obs/core/interface'
import { Box, Flex, Select, Text } from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from "react"
import { useTranslation } from 'react-i18next'
import GeneralSpinner from 'src/componentsOld/general/spinner/GeneralSpinner'
import { SettingsSaveContext } from 'src/pages/main/subpages/settings/SettingsSaveProvider'

export default function OBSCaptureMethod() {
    const { addModified, removeModified, saving, addSaveListener } = useContext(SettingsSaveContext)
    const [originalMethod, setOriginalMethod] = useState<CaptureMethod>(null)
    const [method, setMethod] = useState<CaptureMethod>(null)

    const { obs } = window.api

    useEffect(() => {
        obs.getSettings()
            .then(({ capture_method }) => {
                setOriginalMethod(capture_method)
                setMethod(capture_method)
            })
    }, [saving])

    useEffect(() =>
        addSaveListener(async () => {
            await obs.updateSettings({ capture_method: method })
        })
        , [addSaveListener, method])

    const { t } = useTranslation("settings", { keyPrefix: "obs.video.capture_method" })
    const captureMethodSelector = <Select
        value={method}
        onChange={({ target }) => {
            const { value } = target
            if (value === originalMethod)
                removeModified("capture_method")
            else
                addModified("capture_method")

            setMethod(value as CaptureMethod)
        }}
    >
        <option value="desktop">{t("desktop")}</option>
        <option value="window">{t("window")}</option>
    </Select>

    console.log(originalMethod, method)
    return <Flex
        flexDir='column'
        w='70%'
        justifyContent='center'
        alignItems='center'
    >
        <Text alignSelf='start' mb='8px'>{t("title")}</Text>
        {originalMethod && method ?
            captureMethodSelector :
            <GeneralSpinner loadingText={t("loading")} />
        }
        <Box m='2' />
        <Text size='lg'>{t("window_capture")}</Text>
    </Flex>
}