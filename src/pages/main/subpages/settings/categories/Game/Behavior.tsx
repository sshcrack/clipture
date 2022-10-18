import { Flex, Heading } from '@chakra-ui/react'
import React from "react"
import { useTranslation } from 'react-i18next'
import BehaviorDiscord from 'src/components/settings/categories/Game/Behavior/GameDiscord'
import GameHotkey from 'src/components/settings/categories/Game/Behavior/GameHotkey'

export default function GameBehavior() {
    const { t } = useTranslation("settings", { keyPrefix: "game.behavior" })
    return <>
        <Heading>{t("title")}</Heading>
        <Flex
            w='100%'
            h='100%'
            flexDir='column'
            alignItems='center'
        >
            <GameHotkey />
            <BehaviorDiscord />
        </Flex>
    </>
}