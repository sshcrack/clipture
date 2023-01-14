import { GameManager } from '@backend/managers/game'
import { Notification, NotificationConstructorOptions } from 'electron'
import fs from "fs/promises"
import { MainLogger } from 'src/interfaces/mainLogger'
import { Scene } from '../Scene'
import { DetectableGame, WindowInformation } from '../Scene/interfaces'
import { compareWinInfo, isDetectableGameInfo, isWindowInfoSame, sleepSync } from './tools'

const log = MainLogger.get("Backend", "Managers", "OBS", "Tools")


export function processRunning(pid: number) {
    try {
        process.kill(pid, 0)
        return true
    } catch {
        return false
    }
}

export function listVideos(dir: string) {
    return fs.readdir(dir).then(e => e.filter(e => !e.endsWith(".json")))
}

export async function waitForVideo(dir: string, currVideos: string[], isRecording: () => boolean) {
    let videoName = null
    for (let i = 0; i < 1000; i++) {
        const newVideos = await listVideos(dir)
        if (newVideos.length > currVideos.length) {
            videoName = newVideos.find(e => currVideos.indexOf(e) === -1)
            break
        }

        await sleepSync(50)
        if (!isRecording())
            break;
        if (i % 10 === 0)
            log.silly("Waiting for new video...")
    }

    return videoName
}

export type AvailableGameReturn = {
    winInfo: WindowInformation;
    game: DetectableGame;
    gameDiff: boolean;
    diff: boolean;
}

export async function getAvailableGame(info: WindowInformation[]) {
    const detectableGames = await GameManager.getDetectableGames()
    const toInclude = GameManager.getIncludeList()

    const matchingGames = info.filter(winInfo => {
        return detectableGames.some(game => isDetectableGameInfo(game, winInfo))
    }).concat(info.filter(winInfo => {
        return toInclude.some(e => {
            if (e.type === "detectable")
                return isDetectableGameInfo(e.game, winInfo)
            return isWindowInfoSame(e.game, winInfo)
        })
    }))

    if (matchingGames.length === 0)
        return

    const winInfo = matchingGames.find(e => e.focused) ?? matchingGames[0]
    const currWindow = Scene.getCurrentSetting()?.window

    const prevGame = currWindow && detectableGames.find(e => isDetectableGameInfo(e, currWindow))
    const game = detectableGames.find(e => isDetectableGameInfo(e, winInfo))

    const diff = !compareWinInfo(winInfo, Scene.getCurrentSetting()?.window)


    const toReturn: AvailableGameReturn = {
        winInfo,
        game,
        gameDiff: !prevGame || !game || (prevGame.id !== game.id),
        diff
    }

    return toReturn
}


export function clickableNotification(options: NotificationConstructorOptions, onClick: () => unknown) {
    const notify = new Notification(options)
    notify.on("click", () => onClick())
    return notify
}