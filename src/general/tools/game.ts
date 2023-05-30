import { CloudGeneralGame } from '@backend/managers/game/interface';
import { getIcoUrl } from '.';

export function getGameInfo(game: CloudGeneralGame, original: string) {
    let gameName = "Unknown game"
    let id = null
    let icon = null

    if(!game || !game.game)
        return {
            gameName,
            id,
            icon
        }


    if (game?.type === "detectable") {
        const { aliases, name, icon: innerIcon, id: innerId } = game.game ?? {}
        const detectableName = name ?? aliases?.[0]
        icon = innerIcon;
        id = innerId
7
        if (detectableName)
            gameName = detectableName
    }

    if (game?.type === "window") {
        const { executable, productName, title } = game.game ?? {}
        gameName = productName ?? title?.split("-")?.pop() ?? executable?.replace(".exe", "")
        icon = getIcoUrl(original + ".ico")
    }

    if(game?.type === "cloud") {
        const { icon: innerIcon, id: innerId, title } = game.game
        gameName = title
        icon = innerIcon
        id = innerId
    }

    return {
        gameName,
        id,
        icon
    }
}