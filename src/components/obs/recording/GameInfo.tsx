import { GeneralGame } from '@backend/managers/game/interface';
import { Flex, Image, Text } from '@chakra-ui/react';
import { getGameInfo } from '@general/tools/game';
import { RenderGlobals } from '@Globals/renderGlobals';
import React from "react";

export default function GameInfo({ game, name }: { game: GeneralGame, name: string }) {
    console.log("Game", game, "name", name)
    const { gameName, icon, id } = getGameInfo(game, name.replace(".mkv", ""))
    const imageSrc = id ? `${RenderGlobals.baseUrl}/api/game/image?id=${id ?? "null"}&icon=${icon ?? "null"}` : icon

    return <Flex
        w='100%'
        h='100%'
        justifyContent='center'
        alignItems='center'
    >
        <Image h='6rem' borderRadius='20%' src={imageSrc} pr='4' />
        <Text fontSize='xl'>{gameName}</Text>
    </Flex>
}