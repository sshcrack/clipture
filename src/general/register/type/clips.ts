import { AdditionalCutInfo, Clip, ClipCutInfo, ClipProcessingInfo } from '@backend/managers/clip/interface';
import { Progress } from '@backend/processors/events/interface';
import { addPrefixUnderscoreToObject } from 'src/types/additions';

export type ClipsEventPromises = addPrefixUnderscoreToObject<{
    thumbnail: (clipName: string) => string
    list: () => Clip[],
    exists: (name: string) => boolean,
    cut: (clipsOptions: ClipCutInfo, info: AdditionalCutInfo) => void,
    cutting: () => [string, ClipProcessingInfo][],
    delete: (clipName: string) => void,
    rename: (original: string, newName: string) => void
}, "clips">

export type ClipMainToRender = addPrefixUnderscoreToObject<{
    update: (clip: ClipCutInfo, prog: Progress) => void,
}, "clips">