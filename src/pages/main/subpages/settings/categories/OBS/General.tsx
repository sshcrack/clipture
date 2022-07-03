import { Flex, Heading } from '@chakra-ui/react'
import React, { useEffect } from "react"
import OBSClipPath from 'src/components/settings/categories/OBS/General/OBSClipPath'

export default function OBSGeneral() {

    useEffect(() => {

    }, [])

    return <>
        <Heading>General</Heading>
        <Flex
            w='100%'
            h='100%'
            flexDir='column'
            alignItems='center'
        >
            <OBSClipPath />
        </Flex>
    </>
}