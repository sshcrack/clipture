import { Progress } from '@backend/processors/events/interface';
import { Flex, Heading, useColorModeValue, Progress as ProgressBar, Text } from '@chakra-ui/react';
import { motion } from "framer-motion";
import * as React from "react";

export function InitializePage({ progress }: { progress: Progress }) {
    const { percent, status } = progress
    const primaryName = useColorModeValue("black", "white")
    const secondaryName = useColorModeValue("purple.700", "purple.300")
    const thirdName = useColorModeValue("blue.700", "blue.300")

    const primary = `var(--chakra-colors-${primaryName.replace(".", "-")})`
    const secondary = `var(--chakra-colors-${secondaryName.replace(".", "-")})`
    const third = `var(--chakra-colors-${thirdName.replace(".", "-")})`

    return <Flex
        alignItems='center'
        justifyContent='space-around'
        w='100%'
        h='100%'
        flexDir='column'
    >
        <Flex
            alignItems='center'
            justifyContent='center'
            w='100%'
            h='100%'
            gap='5'
        >
            <svg xmlns="http://www.w3.org/2000/svg"
            width='1'
            height='1'
            style={{ width: "5em", height: "5em" }}
            viewBox='0 0 100 100'
        >
            <motion.circle
                cx={50}
                cy={50}
                fill={primary}
                animate={{ r: [0, 40] }}
            />
            <motion.circle
                cx={50}
                cy={50}
                fill={secondary}
                animate={{ r: [0,  35, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
            />
            <motion.circle
                cx={50}
                cy={50}
                fill={third}
                animate={{ r: [0, 30, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: 1 }}
            />
        </svg>

        <Heading marginLeft='1em'>{status}</Heading>
        </Flex>
        <Flex w='75%' h='100%' gap='5' alignItems='center'>
            <ProgressBar w='100%' colorScheme='green' size='md' value={percent} max={1} />
            <Text justifySelf='end'>{(percent * 100).toFixed(1)}%</Text>
        </Flex>
    </Flex >
}