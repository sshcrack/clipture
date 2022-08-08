import { Flex, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Text } from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from "react"
import GeneralSpinner from 'src/components/general/spinner/GeneralSpinner'
import { RenderLogger } from 'src/interfaces/renderLogger'
import { SettingsSaveContext } from 'src/pages/main/subpages/settings/SettingsSaveProvider'

export default function OBSVideoBitrate() {
    const { addSaveListener, addModified, removeModified, saving } = useContext(SettingsSaveContext)
    const [originalBitrate, setOriginalBitrate] = useState(undefined)
    const [customBitrate, setCustomBitrate] = useState(undefined)
    const { obs } = window.api
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

            const settings = await obs.getSettings()
            await obs.setSettings({ ...settings, bitrate: customBitrate })
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
            max={50000}
            step={50}
            value={customBitrate}
            onChange={e => {
                let i = parseInt(e)
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
            <Text mb='8px'>Bitrate</Text>
            {originalBitrate && customBitrate ?
                numberInput :
                <GeneralSpinner loadingText='Loading...' />
            }
        </Flex>
    </>
}