import { Flex, Heading, Image } from '@chakra-ui/react'
import React from "react"

export default function NotRecordingPlaceholder() {
    return <Flex>
        <Image
            src={"../assets/illustrations/not_recording.gif"}
            w='30em'
            h='30em'
            filter="drop-shadow(2px 4px 20px white)"
        />
        <Heading></Heading>
    </Flex>
}