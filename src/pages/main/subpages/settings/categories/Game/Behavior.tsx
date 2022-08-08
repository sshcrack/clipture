import { Flex, Heading } from '@chakra-ui/react'
import React from "react"
import GameHotkey from 'src/components/settings/categories/Game/Behavior/GameHotkey'

export default function GameBehavior() {
    return <>
        <Heading>Behavior</Heading>
        <Flex
            w='100%'
            h='100%'
            flexDir='column'
            alignItems='center'
        >
            <GameHotkey />
        </Flex>
    </>
}