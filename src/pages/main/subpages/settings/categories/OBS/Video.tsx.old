import { Flex, Heading } from '@chakra-ui/react'
import React from "react"
import { useTranslation } from 'react-i18next'
import AdvancedSelector from 'src/componentsOld/settings/categories/OBS/Video/OBSAdvancedSelector'
import CaptureMethod from 'src/componentsOld/settings/categories/OBS/Video/OBSCaptureMethod'
import EncoderPreset from 'src/componentsOld/settings/categories/OBS/Video/OBSEncoderPreset'
import VideoBitrate from 'src/componentsOld/settings/categories/OBS/Video/OBSVideoBitrate'
import VideoFPS from 'src/componentsOld/settings/categories/OBS/Video/OBSVideoFPS'

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
            <AdvancedSelector>
                <VideoBitrate />
                <EncoderPreset />
            </AdvancedSelector>
            <VideoFPS />
            <CaptureMethod />
        </Flex>
    </>
}