import { CloudWindowInfo } from '@backend/managers/cloud/interface'
import { CloudGeneralGame } from '@backend/managers/game/interface'
import { getIcoUrl } from '@general/tools'
import React from "react"
import DiscordGame from './DiscordGame'
import WindowInfo from './WindowInfo'

export type CloudGameProps = {
    game: CloudGeneralGame,
    original?: string,
    imgSize?: string, fontSize?: string
}

export default function CloudGame({ game, original, imgSize, fontSize }: CloudGameProps) {
    let dcGameId: string = null
    let windowInfo: CloudWindowInfo = null

    if (game?.type === "detectable")
        dcGameId = game.game.id

    if (game?.type === "cloud") {
        windowInfo = game.game
    }

    if (game?.type === "window" && original) {
        const { executable, productName, title } = game.game ?? {}
        const gameName = productName ?? executable?.replace(".exe", "") ?? title?.split("-")?.pop()
        const icon = getIcoUrl(original + ".ico")

        windowInfo = {
            icon,
            title: gameName,
            id: null,
            userId: null
        }
    }

    return <>
        {(!dcGameId && !windowInfo) && <DiscordGame imgSize={imgSize} fontSize={fontSize} id='' />}
        {dcGameId && <DiscordGame imgSize={imgSize} fontSize={fontSize} id={dcGameId} />}
        {windowInfo && <WindowInfo imgSize={imgSize} fontSize={fontSize} info={windowInfo} />}
    </>
}