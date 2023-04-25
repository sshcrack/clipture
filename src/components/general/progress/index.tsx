import { Box, Flex, FlexProps, Grid, position } from '@chakra-ui/react'
import React from "react"
import './style.css'

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
            bgGradient='linear(to right, pg_bar.disabled.0 50%, pg_bar.disabled.1 100%);'
            rounded='full'
        />
        <Flex
            position='absolute'
            top='0'
            left='0'
            style={{ width: `${1 * 100}%` }}
            h='100%'
            bgGradient='linear(to right, brand.secondary 0%, brand.primary 100%);'
            rounded='full' />
    </Box>

    const grad = "linear-gradient(to right, #21aefd 0%, #b721ff 100%)";
    return !stroke ? comp : <Flex
        {...props}
        p='10'
        justifyContent='center'
        alignItems='center'
        position='relative'
        border='5px solid transparent'
        _before={{
            content: '""',
            position: "absolute",
            top: "-5px",
            right: "-5px",
            left: "-5px",
            bottom: "-5px",
            zIndex: "-1",
            borderRadius: "100%",
            backgroundImage: grad
        }}
        rounded='full'
    >
        {comp}
    </Flex>;
}