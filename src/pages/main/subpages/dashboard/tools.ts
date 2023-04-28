export function strToId(site: string) {
    return site.split(" ").join("_").toLowerCase()
}

export function sitesToIndex(sites: string[], mode: string) {
    return sites.findIndex(e => strToId(e) === mode)
}