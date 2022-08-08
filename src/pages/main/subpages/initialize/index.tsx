import { Progress } from '@backend/processors/events/interface';
import { Flex, Heading, useColorModeValue } from '@chakra-ui/react';
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
        justifyContent='center'
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
                animate={{ r: [0, percent * 50] }}
            />
            <motion.circle
                cx={50}
                cy={50}
                fill={secondary}
                animate={{ r: [0, percent * 45, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
            />
            <motion.circle
                cx={50}
                cy={50}
                fill={third}
                animate={{ r: [0, percent * 40, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: 1 }}
            />
        </svg>

        <Heading marginLeft='1em'>{status}</Heading>
    </Flex >
}