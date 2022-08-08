import { Flex, Heading } from '@chakra-ui/react'
import React, { useEffect } from "react"
import OBSAutostart from 'src/components/settings/categories/OBS/General/OBSAutostart'
import OBSClipPath from 'src/components/settings/categories/OBS/General/OBSClipPath'

export default function OBSGeneral() {
    return <>
        <Heading>General</Heading>
        <Flex
            w='100%'
            h='100%'
            flexDir='column'
            alignItems='center'
        >
            <OBSAutostart />
            <OBSClipPath />
        </Flex>
    </>
}