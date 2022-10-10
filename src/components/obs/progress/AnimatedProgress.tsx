import React from "react"
import { motion } from "framer-motion"
import { Flex, Text } from '@chakra-ui/react'
import GradientLoader from 'src/components/general/gradientLoader/gradientLoader'

type Props = {
    percent: number,
    status: string,
    primaryColor: string,
    secondaryColor: string,
    animate: boolean
}

export default function AnimatedProgress({ percent, status, primaryColor, secondaryColor, animate }: Props) {
    const textPercentage = Math.round(percent * 1000) / 10
    return <motion.div
        style={{
            display: "grid",
            flex: 1,
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column"
        }}
        initial={{ transform: "scale(1)" }}
        animate={{ transform: animate ? "scale(1.1)" : "scale(1)" }}
        transition={{
            delay: 0,
            duration: 2.5,
            repeat: Infinity,
            repeatType: "mirror"
        }}
    >
        <Flex
            w='15em'
            h='15em'
            gridRow='1'
            gridColumn='1'
        >
            <GradientLoader
                percent={percent}
                size='15em'
                gradient={[primaryColor, secondaryColor]}
            />
        </Flex>
        <Flex
            w='15em'
            h='15em'
            p='1em'
            justifyContent='center'
            alignItems='center'
            gridRow='1'
            gridColumn='1'
            zIndex='10'
            flexDir='column'
        >
            <Text color={secondaryColor} fontSize='2em'>{status}</Text>
            <Text color={secondaryColor} fontSize='2em'>{textPercentage.toFixed(1)}%</Text>
        </Flex>
    </motion.div>
}