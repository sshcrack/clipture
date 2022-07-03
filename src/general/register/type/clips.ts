import { Clip, ClipCutInfo, ClipProcessingInfo } from '@backend/managers/clip/interface';
import { Progress } from '@backend/processors/events/interface';
import { addPrefixUnderscoreToObject } from 'src/types/additions';

export type ClipsEventPromises = addPrefixUnderscoreToObject<{
    thumbnail: (clipName: string) => string
    list: () => Clip[],
    exists: (name: string) => boolean,
    cut: (clipsOptions: ClipCutInfo) => void,
    cutting: () => [string, ClipProcessingInfo][],
    delete: (clipName: string) => void
}, "clip">

export type ClipMainToRender = addPrefixUnderscoreToObject<{
    clip_update: (clip: ClipCutInfo, prog: Progress) => void,
}, "clip">