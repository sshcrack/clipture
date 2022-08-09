import { Box, Divider, Flex, FlexProps } from '@chakra-ui/react';
import React from "react";
import { useTranslation } from 'react-i18next';
import Category from './SettingsMenuCategory';
import Item from './SettingsMenuItem';

export default function SettingsMenu(props: FlexProps) {
    const { t } = useTranslation("settings", { keyPrefix: "menu" })

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
                <Category category={t("obs_clipture.title")}>
                    <Item link='general' label={t("obs_clipture.general")} defaultItem />
                    <Item link='video' label={t("obs_clipture.video")} />
                    <Item link='audio' label={t("obs_clipture.audio")}></Item>
                </Category>

                <Divider />

                <Category category='Game'>
                    <Item link='list' label={t("game.list")} />
                    <Item link='behavior' label={t("game.behavior")} />
                </Category>
            </Flex>
        </Box>
    </Flex>
}