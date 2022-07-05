import { Flex, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Text } from '@chakra-ui/react'
import React, { useEffect, useState } from "react"

export default function OBSVideoCoreSettings() {
    const [ settings, setSettings ] = useState(null)
    const { obs } = window.api
    useEffect(() => {
        obs.getSettings()
    }, [ settings])

    return <>
        <Flex>
            <Text>Bitrate</Text>
            <NumberInput defaultValue={15} min={10} max={20}>
                <NumberInputField />
                <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                </NumberInputStepper>
            </NumberInput>
        </Flex>
    </>
}