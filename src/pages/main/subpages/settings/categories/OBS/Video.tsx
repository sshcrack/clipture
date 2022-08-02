import { Flex, Heading } from '@chakra-ui/react'
import React from "react"
import OBSVideoBitrate from 'src/components/settings/categories/OBS/Video/OBSVideoBitrate'
import OBSVideoFPS from 'src/components/settings/categories/OBS/Video/OBSVideoFPS'

export default function OBSVideo() {
    return <>
        <Heading>General</Heading>
        <Flex
            w='100%'
            h='100%'
            flexDir='column'
            alignItems='center'
        >
            <OBSVideoBitrate />
            <OBSVideoFPS />
        </Flex>
    </>
}