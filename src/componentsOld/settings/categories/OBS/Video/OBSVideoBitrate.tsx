import { Flex, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Text } from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from "react"
import { useTranslation } from 'react-i18next'
import GeneralSpinner from 'src/componentsOld/general/spinner/GeneralSpinner'
import { SettingsSaveContext } from 'src/pages/main/subpages/settings/SettingsSaveProvider'

export default function OBSVideoBitrate() {
    const [originalBitrate, setOriginalBitrate] = useState(undefined as number)
    const [customBitrate, setCustomBitrate] = useState(undefined as number)

    const { addSaveListener, addModified, removeModified, saving } = useContext(SettingsSaveContext)
    const { obs } = window.api
    const { t } = useTranslation("settings", { keyPrefix: "obs.video.bitrate" })

    useEffect(() => {
        obs.getSettings()
            .then(({ bitrate }) => {
                setOriginalBitrate(bitrate)
                setCustomBitrate(bitrate)
            })
    }, [saving])

    useEffect(() => {
        return addSaveListener(async () => {
            console.log("Adding Save listener for bitrate", customBitrate)

            await obs.updateSettings({ bitrate: customBitrate })
        })
    }, [customBitrate, addSaveListener])

    const numberInput = <Flex
        justifyContent='center'
        alignItems='center'
        gap='1'
    >
        <NumberInput
            w='100%'
            defaultValue={15}
            min={1000}
            max={100000}
            step={50}
            value={customBitrate}
            onChange={e => {
                const i = parseInt(e)
                if (originalBitrate !== customBitrate)
                    addModified("video_bitrate")
                else
                    removeModified("video_bitrate")

                setCustomBitrate(i)
            }}
        >
            <NumberInputField />
            <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
            </NumberInputStepper>
        </NumberInput>
        <Text>Kbps</Text>
    </Flex>

    return <>
        <Flex
            flexDir='column'
            w='70%'
        >
            <Text mb='8px'>{t("title")}</Text>
            {originalBitrate !== undefined && customBitrate !== undefined ?
                numberInput :
                <GeneralSpinner loadingText={t("loading")} />
            }
        </Flex>
    </>
}