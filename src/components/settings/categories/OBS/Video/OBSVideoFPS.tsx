import { Flex, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Text } from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from "react"
import { useTranslation } from 'react-i18next'
import GeneralSpinner from 'src/components/general/spinner/GeneralSpinner'
import { SettingsSaveContext } from 'src/pages/main/subpages/settings/SettingsSaveProvider'

export default function OBSVideoFPS() {
    const { addSaveListener, addModified, removeModified, saving } = useContext(SettingsSaveContext)
    const [originalFPS, setOriginalFPS] = useState(undefined)
    const [fps, setFPS] = useState(undefined)

    const { obs } = window.api
    const { t } = useTranslation("settings", { keyPrefix: "obs.video.fps" })
    useEffect(() => {
        obs.getSettings()
            .then(({ fps }) => {
                console.log("Setting fps to", fps)
                setOriginalFPS(fps)
                setFPS(fps)
            })
    }, [saving])

    useEffect(() => {
        return addSaveListener(async () => {
            console.log("Adding Save listener for fps", fps)

            const settings = await obs.getSettings()
            await obs.setSettings({ ...settings, fps: fps })
        })
    }, [fps, addSaveListener])

    const numberInput = <Flex
        justifyContent='center'
        alignItems='center'
        gap='1'
    >
        <NumberInput
            w='100%'
            defaultValue={15}
            min={1}
            max={60}
            step={1}
            value={fps}
            onChange={e => {
                let i = parseInt(e)
                if(isNaN(i))
                    return

                if (originalFPS !== fps)
                    addModified("video_fps")
                else
                    removeModified("video_fps")

                setFPS(i)
            }}
        >
            <NumberInputField />
            <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
            </NumberInputStepper>
        </NumberInput>
    </Flex>

    return <>
        <Flex
            flexDir='column'
            w='70%'
        >
            <Text mb='8px'>{t("title")}</Text>
            {originalFPS !== undefined && fps !== undefined ?
                numberInput :
                <GeneralSpinner loadingText={t("loading")} />
            }
        </Flex>
    </>
}