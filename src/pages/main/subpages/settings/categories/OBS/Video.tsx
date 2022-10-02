import { Flex, Heading } from '@chakra-ui/react'
import React from "react"
import { useTranslation } from 'react-i18next'
import OBSCaptureMethod from 'src/components/settings/categories/OBS/Video/OBSCaptureMethod'
import OBSVideoBitrate from 'src/components/settings/categories/OBS/Video/OBSVideoBitrate'
import OBSVideoFPS from 'src/components/settings/categories/OBS/Video/OBSVideoFPS'

export default function OBSVideo() {
    const { t } = useTranslation("settings", { keyPrefix: "obs.video" })
    return <>
        <Heading>{t("title")}</Heading>
        <Flex
            w='100%'
            h='100%'
            flexDir='column'
            alignItems='center'
            gap='5'
        >
            <OBSVideoBitrate />
            <OBSVideoFPS />
            <OBSCaptureMethod />
        </Flex>
    </>
}