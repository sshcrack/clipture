import { DetectableGame, WindowInformation } from '../obs/Scene/interfaces'

export type GeneralGame = {
    type: "detectable",
    game: DetectableGame
} | {
    type: "window",
    game: WindowInformation
}