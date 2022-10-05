import { Flex, Heading } from '@chakra-ui/react'
import React from "react"
import { useTranslation } from 'react-i18next'
import LanguageSelector from 'src/components/settings/categories/OBS/General/LanguageSelector'
import OBSAutostart from 'src/components/settings/categories/OBS/General/OBSAutostart'
import OBSClipPath from 'src/components/settings/categories/OBS/General/OBSClipPath'
import OBSDiscord from 'src/components/settings/categories/OBS/General/OBSDiscord'

export default function OBSGeneral() {
    const { t } = useTranslation("settings", { keyPrefix: "obs.general" })
    return <>
        <Heading>{t("title")}</Heading>
        <Flex
            w='100%'
            h='100%'
            gap='5'
            flexDir='column'
            alignItems='center'
        >
            <OBSAutostart />
            <OBSDiscord />
            <OBSClipPath />
            <LanguageSelector />
        </Flex>
    </>
}