import { Button, Flex } from '@chakra-ui/react';
import type { IInput } from '@streamlabs/obs-studio-node';
import React, { useEffect, useState } from "react"

export default function Clips() {
    const { obs} = window.api
    const [ available, setAvailable ] = useState<IInput[]>()
    const [ update, setUpdate ] = useState(() => Math.random())

    useEffect(() => {
        obs.available_windows()
            .then(setAvailable)
    }, [update])

    return <Flex
        justifyContent='start'
        alignItems='center'
    >
        {JSON.stringify(available)}
        <Button onClick={() => setUpdate(Math.random())}>Update</Button>
    </Flex>
}