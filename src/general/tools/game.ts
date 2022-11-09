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


    console.log(game?.type === "detectable", !!game?.game, game.type)
    if (game?.type === "detectable") {
        const { aliases, name, icon: innerIcon, id: innerId } = game.game ?? {}
        const detectableName = name ?? aliases?.[0]
        icon = innerIcon;
        id = innerId

        if (detectableName)
            gameName = detectableName
    }

    if (game?.type === "window") {
        const { executable, productName, title } = game.game ?? {}
        gameName = productName ?? executable?.replace(".exe", "") ?? title?.split("-")?.pop()
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