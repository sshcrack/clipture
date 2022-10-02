import { CaptureMethod } from '@backend/managers/obs/core/interface'
import { Flex, Select, Text } from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from "react"
import { useTranslation } from 'react-i18next'
import GeneralSpinner from 'src/components/general/spinner/GeneralSpinner'
import { SettingsSaveContext } from 'src/pages/main/subpages/settings/SettingsSaveProvider'

export default function OBSCaptureMethod() {
    const { addModified, removeModified } = useContext(SettingsSaveContext)
    const [setCaptureMethod, captureMethod] = useState<CaptureMethod>(null)

    useEffect(() => {

    }, [])

    const { t } = useTranslation("settings", { keyPrefix: "obs.video.capture_method" })
    const captureMethodSelector = <Select>
        <option value="desktop">t("desktop")</option>
        <option value="window">t("window")</option>
    </Select>

    return <Flex
        flexDir='column'
        w='70%'
    >
        <Text mb='8px'>{t("title")}</Text>
        {captureMethod ?
            captureMethodSelector :
            <GeneralSpinner loadingText={t("loading")} />
        }
    </Flex>
}