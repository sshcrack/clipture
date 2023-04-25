import { Button, Flex, Heading } from '@chakra-ui/react'
import React from "react"
import { useTranslation } from 'react-i18next'
import BehaviorDiscord from 'src/componentsOld/settings/categories/Game/Behavior/GameDiscord'
import GameHotkey from 'src/componentsOld/settings/categories/Game/Behavior/GameHotkey'
import OverlayEnable from 'src/componentsOld/settings/categories/Game/Behavior/OverlayEnable'

export default function GameBehavior() {
    const { t } = useTranslation("settings", { keyPrefix: "game.behavior" })
    return <>
        <Heading>{t("title")}</Heading>
        <Flex
            w='100%'
            h='100%'
            gap='3'
            flexDir='column'
            alignItems='center'
        >
            <GameHotkey />
            <BehaviorDiscord />
            <OverlayEnable />
            <Button onClick={() => window.api.overlay.openDevWindow()}>
                Open Overlay DevWindow
            </Button>
        </Flex>
    </>
}