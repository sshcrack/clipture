import { Box, BoxProps, Flex } from '@chakra-ui/react'
import { ExpFilter } from '@general/ExpFilter'
import React, { useEffect, useState } from "react"

export default function Volmeter({ source, ...props }: { source: string } & BoxProps) {
    const { audio } = window.api
    const [percentage, setPercentage] = useState(0)
    const [, setCurrVal] = useState(-Infinity)

    useEffect(() => {
        const filter = new ExpFilter(0, 0.2, 0.2)
        setPercentage(0)
        const audioRemove = audio.onVolmeterChange((innerSource, ...channels) => {
            if (innerSource !== source)
                return

            const getAvg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length

            const averages = channels.map(e => getAvg(e))
            const maxInChannels = Math.max(...averages)
            const maxChannelIndex = averages.findIndex(e => e === maxInChannels)
            const m = channels[maxChannelIndex]
            if (!m)
                return console.error("Could not find m", maxChannelIndex, maxInChannels, averages)

            const avg = Math.abs(getAvg(m));
            const max = Math.min(1, avg / 60)

            const newVal = filter.update(1 - max)
            setPercentage(newVal)
            setCurrVal(avg)
        })

        return () => {
            audioRemove()
        }
    }, [source])

    return <Flex
        w='100%'
        h='1rem'
        bg='gray.500'
        justifyContent='start'
        alignItems='center'
        rounded='xl'
        {...props}
    >
        <Box
            bg='green.300'
            h='100%'
            rounded='xl'
            transition=".05s all linear"
            style={{ width: `${percentage * 100}%` }}
        />
    </Flex>
}