import { DetectableGame } from '@backend/managers/obs/Scene/interfaces';
import { Flex, Spinner, Text, useToast } from '@chakra-ui/react';
import { RenderGlobals } from '@Globals/renderGlobals';
import React, { useEffect, useState } from 'react';

export type Props = { id: string, imgSize?: string, fontSize?: string, update?: number }
export default function DiscordGame({ id, fontSize, imgSize, update }: Props) {
    const [games, setGames] = useState<DetectableGame[] | null>(null)
    const toast = useToast()

    useEffect(() => {
        window.api.game.detectable()
            .then(e => setGames(e))
            .catch(err => {
                console.error(err)
                toast({
                    status: "error",
                    title: "Error",
                    description: "Could not get detectable games"
                })
            })

    }, [])

    if (!games)
        return <Spinner />

    const { icon, id: gameId, name } = games.find(e => e.id === id) ?? {}
    if (!icon || !gameId)
        return <Flex
        p='3'
        justifyContent='center'
        alignItems='center'
        borderBottomRightRadius='md'
        gap='3'
    >
            <img
                src={`https://clipture.sshcrack.me/api/game/image?id=null&icon=null&update=${update}`}
                alt='Unknown Game'
                style={{
                    width: imgSize ?? "1.5rem",
                    height: imgSize ?? "1.5rem",
                    borderRadius: "var(--chakra-radii-md)"
                }} />
            <Text fontSize={fontSize} whiteSpace='nowrap'>Unknown Game</Text>
        </Flex>

    return <Flex
        p='3'
        justifyContent='center'
        alignItems='center'
        borderBottomRightRadius='md'
        gap='3'
    >
        <img
            src={`${RenderGlobals.baseUrl}/api/game/image?id=${gameId}&icon=${icon}&update=${update}`}
            alt='Game Image'
            style={{
                width: imgSize ?? "1.5rem",
                height: imgSize ?? "1.5rem",
                borderRadius: "var(--chakra-radii-md)"
            }}
        />
        <Text fontSize={fontSize} whiteSpace='nowrap'>{name}</Text>
    </Flex>
}