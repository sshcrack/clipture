import { DetectableGame } from '@backend/managers/obs/Scene/interfaces';
import { Flex, Spinner, Text, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

export type Props = { id: string, imgSize?: string, fontSize?: string }
export default function DiscordGame({ id, fontSize, imgSize }: Props) {
    const [games, setGames] = useState<DetectableGame[] | null>(null)
    const toast = useToast()

    useEffect(() => {
        fetch("/api/game/detection")
            .then(e => e.json() as Promise<DetectableGame[]>)
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
        return <Flex>
            <img src='unknown.png' width={32} height={32} alt='Unknown Game' />
        </Flex>

    return <Flex
        p='3'
        justifyContent='center'
        alignItems='center'
        borderBottomRightRadius='md'
        gap='3'
    >
        <img
            src={`/api/game/image?id=${gameId}&icon=${icon}`}
            alt='Game Image'
            style={{
                width: imgSize ?? "1.5rem",
                height: imgSize ?? "1.5rem",
                borderRadius: "var(--chakra-radii-md)"
            }}
        />
        <Text fontSize={fontSize}>{name}</Text>
    </Flex>
}