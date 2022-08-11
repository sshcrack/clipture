// Modified from https://github.com/stream-labs/streamlabs-obs/blob/staging/app/util/operating-systems.ts

import { app } from "electron";
import path from "path"

export const OS = {
    Windows: 'win32',
    Mac: 'darwin',
}

export type SupportedOS = 'aix' | 'android' | 'darwin' | 'freebsd' | 'haiku' | 'linux' | 'openbsd' | 'sunos' | 'win32' | 'cygwin' | 'netbsd'
export type HandlersInput<T> = {
    [key in SupportedOS]?: T
}

export function byOS<T>(handlers: HandlersInput<T>): T {
    const handler = handlers[process.platform];

    if (typeof handler === 'function') return handler();

    return handler;
}

export function getOS() {
    return process.platform
}