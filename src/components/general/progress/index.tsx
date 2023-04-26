import { Box, Flex, FlexProps, Grid, Text, position } from '@chakra-ui/react'
import React from "react"
import './style.css'
import GradientBorder from '../gradientBorder'
import { BRAND_GRADIENT } from '../consts'

export type ProgressBarProps = {
    progress: number
    stroke?: boolean
} & Omit<FlexProps, "children" | "stroke">

export default function ProgressBar({ stroke, progress, ...props }: ProgressBarProps) {
    const comp = <Box
        h="100%"
        w="100%"
        justifyContent='center'
        alignItems='center'
        position="relative"
        {...props}
    >
        <Flex
            position='absolute'
            top='0'
            left='0'
            w='100%'
            h='100%'
            opacity='50%'
            bgGradient='linear(to right, pg_bar.disabled.0 50%, pg_bar.disabled.1 100%);'
            rounded='full'
        />
        <Flex
            position='absolute'
            top='0'
            left='0'
            style={{ width: `${progress * 100}%` }}
            h='100%'
            bgGradient={BRAND_GRADIENT}
            rounded='full' />
        <Flex
            position='absolute'
            left='50%'
            top='50%'
            transform='translate(-50%, -50%)'
        >
            <Flex
                position="relative"
                w='100%'
                h='100%'
                justifyContent='center'
                alignItems='center'
            >
                <Text
                position='absolute'
                fontSize='4xl'
                mixBlendMode='overlay'
                left='0'
                top='0'
                transform='translate(-50%, -50%)'
                >{(progress * 100).toFixed(1)}%</Text>
                <Text
                position='absolute'
                fontSize='4xl'
                left='0'
                top='0'
                transform='translate(-50%, -50%)'
                opacity='0'
                >999.9%</Text>
            </Flex>
        </Flex>
    </Box>

    const size = 3
    const sizeStr = size + "px"
    const spacingConst = `${props.height ?? props.h ?? sizeStr} * 0.5`;
    const sides = `calc(${spacingConst} * 0.1 + var(--chakra-space-5))`;
    return !stroke ? comp : <GradientBorder
        {...props}
        size={size}
        p={`calc(${spacingConst} + var(--chakra-space-5))`}
        pl={sides}
        pr={sides}
        radius='99999px'
        full
        justifyContent='center'
        alignItems='center'
        _before={{ opacity: '50%' }}
        gradient={BRAND_GRADIENT}
    >
        {comp}
    </GradientBorder>;
}