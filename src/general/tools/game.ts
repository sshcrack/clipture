import { GeneralGame } from '@backend/managers/game/interface';
import { getIcoUrl } from '.';

export function getGameInfo(game: GeneralGame, name: string) {
    let gameName = "Unknown game"
    let id = null
    let icon = null

    if (game && game.game && game?.type === "detectable") {
        const { aliases, name, icon: innerIcon, id: innerId } = game.game ?? {}
        const detectableName = name ?? aliases?.[0]
        icon = innerIcon;
        id = innerId
        if (detectableName)
            gameName = detectableName
    }

    if (game && game.game && game?.type === "window") {
        const { executable, productName, title } = game.game ?? {}
        gameName = productName ?? executable?.replace(".exe", "") ?? title?.split("-")?.pop()
        icon = getIcoUrl(name + ".ico")
    }

    return {
        gameName,
        id,
        icon
    }
}