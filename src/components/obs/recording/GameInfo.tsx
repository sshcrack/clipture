import { GeneralGame } from '@backend/managers/game/interface';
import { Flex, Image, Text } from '@chakra-ui/react';
import { getGameInfo } from '@general/tools/game';
import { RenderGlobals } from '@Globals/renderGlobals';
import React from "react";

export default function GameInfo({ game }: { game: GeneralGame }) {
    const { gameName, icon, id } = getGameInfo(game)
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