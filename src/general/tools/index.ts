export function isFilenameValid(path: string) {

    const isEmpty = path === ''
    const filenameValid = /^([\w,\s-]|-|_)+$/.test(path)
    return !isEmpty && filenameValid && path && !path.includes("..") && !path.includes("\\") && !path.includes("/")
}

export function getVideoSourceUrl(name: string) {
    return `clip-video-file:///${encodeURIComponent(name)}`
}