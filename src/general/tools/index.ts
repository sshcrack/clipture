export function isFilenameValid(path: string) {

    const isEmpty = path === ''
    const filenameValid = /^([\w,\s-]|-|_)+$/.test(path)
    return !isEmpty && filenameValid && path && !path.includes("..") && !path.includes("\\") && !path.includes("/")
}

export function getVideoSourceUrl(name: string) {
    return `clip-video-file:///${encodeURIComponent(name)}`
}

export function secondsToDuration(sec_num: number) {
    const hoursNum   = Math.floor(sec_num / 3600);
    const minutesNum = Math.floor((sec_num - (hoursNum * 3600)) / 60);
    const secondsNum = sec_num - (hoursNum * 3600) - (minutesNum * 60);

    let hours = hoursNum.toString()
    let minutes = minutesNum.toString()
    let seconds = Math.ceil(secondsNum).toString()

    if (hoursNum   < 10) {hours   = "0"+hours;}
    if (minutesNum < 10) {minutes = "0"+minutes;}
    if (secondsNum < 10) {seconds = "0"+seconds;}

    return hours + ':' + minutes + ':' + seconds;
}


export function scaleKeepRatioSpecific(width: number, height: number, max: { height: number, width: number}, lowest = false) {
    const { width: maxWidth, height: maxHeight } = max
    const ratio = (lowest ? Math.max : Math.min)(width / maxWidth, height / maxHeight);
    return [width / ratio, height / ratio];
}