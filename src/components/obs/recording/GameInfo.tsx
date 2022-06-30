import { DetectableGame } from '@backend/managers/obs/Scene/interfaces';
import { Flex, Image, Text } from '@chakra-ui/react';
import { RenderGlobals } from '@Globals/renderGlobals';
import React from "react"

export default function GameInfo({ game }: { game: DetectableGame }) {
    const { name, aliases, id, icon } = game ?? {}
    const gameName = name ?? aliases?.[0] ?? "Unknown Game"
    const imageSrc = `${RenderGlobals.baseUrl}/api/game/image?id=${id ?? "null"}&icon=${icon ?? "null"}`

    return <Flex
        w='100%'
        h='100%'
        justifyContent='center'
        alignItems='center'
    >
        <Image borderRadius='20%' src={imageSrc} pr='4' />
        <Text>{gameName}</Text>
    </Flex>
}