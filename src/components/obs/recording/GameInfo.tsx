import { GeneralGame } from '@backend/managers/game/interface';
import { Flex, Image, Text } from '@chakra-ui/react';
import { getGameInfo } from '@general/tools/game';
import { RenderGlobals } from '@Globals/renderGlobals';
import React from "react";

export default function GameInfo({ game, name }: { game: GeneralGame, name: string }) {
    console.log("Game", game, "name", name)
    const { gameName, icon, id } = getGameInfo(game, name)
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