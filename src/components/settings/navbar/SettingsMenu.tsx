import { Box, Divider, Flex, FlexProps } from '@chakra-ui/react';
import React from "react";
import Category from './SettingsMenuCategory';
import Item from './SettingsMenuItem';

export default function SettingsMenu(props: FlexProps) {
    const width = '218px'
    return <Flex
        flex={`1 0 ${width}`}
        flexDir='column'
        h='100%'
        justifyContent='start'
        alignItems='end'
        bg='gray.900'
        {...props}
    >
        <Box w={width}>
            <Flex
                w='100%'
                h='100%'
                flexDir='column'
                gap='.25rem'
            >
                <Category category='OBS'>
                    <Item label='General' defaultItem />
                    <Item label='Video' />
                    <Item label='Audio'></Item>
                </Category>

                <Divider />

                <Category category='Game'>
                    <Item label='List' />
                    <Item label='Behavior' />
                </Category>
            </Flex>
        </Box>
    </Flex>
}