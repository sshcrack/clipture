import { Flex, Heading } from '@chakra-ui/react'
import React from "react"
import { useTranslation } from 'react-i18next'
import GameExcludeList from 'src/components/settings/categories/Game/List/GameExcludeList'
import GameIncludeList from 'src/components/settings/categories/Game/List/GameIncludeList'

export default function GameList() {
    const { t } = useTranslation("settings", { keyPrefix: "game.list"})

    return <>
        <Heading>{t("title")}</Heading>
        <Flex
            w='100%'
            h='100%'
            flexDir='column'
            alignItems='center'
        >
            <GameExcludeList />
            <GameIncludeList />
        </Flex>
    </>
}