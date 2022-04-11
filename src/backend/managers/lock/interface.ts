import { Progress } from '../../processors/events/interface'

export type ListenerFunc = (locked: boolean, progress: Progress) => unknown
export type LockedReturnType = {
    locked: boolean,
    progress: Progress
}