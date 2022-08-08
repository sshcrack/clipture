import { Flex, Heading } from '@chakra-ui/react'
import React from "react"
import { motion } from "framer-motion"
import { getCSSVariable } from '@general/tools'


const FlexMotion = motion(Flex)
export default function EmptyPlaceholder({ img }: { img?: string }) {

    const primary = getCSSVariable("--chakra-colors-illustration-primary")
    const secondary = getCSSVariable("--chakra-colors-illustration-secondary")
    const tertiary = getCSSVariable("--chakra-colors-illustration-tertiary")
    return <Flex
        justifyContent='center'
        alignItems='center'
        w='100%'
        h='100%'
        flexDir='column'
    >
        <FlexMotion
            flex='1'
            filter='drop-shadow(2px 4px var(--placeholder-blur-size) var(--placeholder-color))'
            zIndex='-1000'
            backgroundRepeat='no-repeat'
            backgroundPosition='center'
            backgroundSize='contain'
            backgroundImage={img ?? 'url(../assets/illustrations/empty.gif)'}
            width='100%'
            height='100%'
            animate={{
                "--placeholder-color": [ primary, secondary, tertiary],
                "--placeholder-blur-size": [ "7rem", "2rem", "8rem"]
            } as any}
            transition={{
                repeat: Infinity,
                repeatType: "mirror",
                duration: 20
            }}
        />
        <Heading fontSize='2.25vw'>Pretty empty isn't it? Gonna ahead, play some games!</Heading>
        <Heading fontSize='1.75vw'>They'll automatically be recorded</Heading>
    </Flex>
}