import { Flex, Heading } from '@chakra-ui/react'
import React from "react"
import OBSInputDevices from 'src/components/settings/categories/OBS/Audio/OBSInputDevices'

export default function OBSAudio() {
    return <>
        <Heading>Audio</Heading>
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