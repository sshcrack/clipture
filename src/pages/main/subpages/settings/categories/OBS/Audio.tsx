import { Flex, Heading } from '@chakra-ui/react'
import React from "react"
import { useTranslation } from 'react-i18next'
import OBSInputDevices from 'src/components/settings/categories/OBS/Audio/OBSInputDevices'

export default function OBSAudio() {
    const { t } = useTranslation("settings", { keyPrefix: "obs.audio"})
    return <>
        <Heading>{t("title")}</Heading>
        <Flex
            w='100%'
            h='100%'
            flexDir='column'
            alignItems='center'
        >
            <OBSInputDevices />
        </Flex>
    </>
}