import { Box, Flex } from '@chakra-ui/react';
import React from "react";
import Category from './SettingsMenuCategory';
import Item from './SettingsMenuItem';

export default function SettingsMenu() {
    return <Flex
        flex='1 0 218px'
        flexDir='column'
        h='100%'
        justifyContent='start'
    >
        <Box w='218px'>
            <Flex
                w='100%'
                h='100%'
                flexDir='column'
                justifyContent='start'
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