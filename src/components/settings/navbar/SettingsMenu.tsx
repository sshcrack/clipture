import { Box, Flex } from '@chakra-ui/react';
import React from "react";
import Category from './SettingsMenuCategory';
import Item from './SettingsMenuItem';

export default function SettingsMenu() {
    const width = '218px'
    return <Flex
        flex={`1 0 ${width}`}
        flexDir='column'
        h='100%'
        justifyContent='start'
        alignItems='end'
    >
        <Box w={width}>
            <Flex
                w='100%'
                h='100%'
                flexDir='column'
                gap='.25rem'
            >
                <Category>OBS</Category>
                <Item label='General' defaultItem />
                <Item label='Video' />
                <Item label='Audio'></Item>
                <Category>Game</Category>
                <Item label='List' />
                <Item label='Behavior' />
            </Flex>
        </Box>
    </Flex>
}