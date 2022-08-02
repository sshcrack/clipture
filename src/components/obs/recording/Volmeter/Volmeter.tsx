import { Box, BoxProps, Flex } from '@chakra-ui/react'
import { ExpFilter } from '@general/ExpFilter'
import React, { useEffect, useState } from "react"

export default function Volmeter({ source, ...props }: { source: string } & BoxProps) {
    const { audio } = window.api
    const [percentage, setPercentage] = useState(0)

    useEffect(() => {
        const filter = new ExpFilter(0, 0.2, 0.2)
        setPercentage(0)

        return audio.onVolmeterChange((innerSource, m) => {
            const avg = Math.abs(m.reduce((a, b) => a + b, 0) / m.length);
            const max = Math.min(1, avg / 60)
            if (source !== innerSource)
                return

            const newVal = filter.update(1 - max)
            setPercentage(newVal)
        })
    }, [ source ])

    return <Flex
        w='100%'
        h='1rem'
        bg='gray.500'
        justifyContent='start'
        alignItems='center'
        rounded='xl'
    >
        <Box
            bg='green.300'
            h='100%'
            rounded='xl'
            transition=".05s all linear"
            {...props}
            w={`${percentage * 100}%`}
        />
    </Flex>
}