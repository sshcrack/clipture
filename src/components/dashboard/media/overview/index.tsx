import { MediaCategoriesType } from '@Globals/index'
import { Grid, GridProps } from '@chakra-ui/react'
import React from "react"
import GeneralMediaItem from '..'
import { Distributor, OS } from '@backend/managers/obs/Scene/interfaces'
import { GeneralMediaInfo, MediaStatus } from '@backend/managers/clip/new_interfaces'

export type MediaOverviewProps = {
    category: MediaCategoriesType
} & Omit<GridProps, "children">

export default function MediaOverview({ category, ...props }: MediaOverviewProps) {
    const items: GeneralMediaInfo[] = [
        {
            info: {
                mediaName: "AAAH WALL OF FLESH",
                game: {
                    type: "detectable",
                    game: { "aliases": ["Tom Clancy's Rainbow Six? Siege"], "description": "A first-person tactical shooter developed by Ubisoft Montreal Studios. In this installment of the Rainbow Six series, some players are focused on assault where as others are defense-oriented.", "developers": [{ "id": "521816502500982842", "name": "Ubisoft Montreal Studios" }], "executables": [{ "is_launcher": false, "name": "rainbowsix.exe", "os": OS.Win32 }], "guild_id": "253581140072464384", "hook": true, "icon": "554af7ef210877b5f04fd1b727a3746e", "id": "356876590342340608", "name": "Tom Clancy's Rainbow Six Siege", "overlay": true, "overlay_compatibility_hook": true, "publishers": [{ "id": "521816654095843331", "name": "Ubisoft Montreal" }, { "id": "521816502500982841", "name": "Ubisoft Entertainment" }], "splash": "028fe9a1748d259872a0dfa49eb818f2", "summary": "", "third_party_skus": [{ "distributor": Distributor.Steam, "id": "359550", "sku": "359550" }], "type": 1, "verify_key": "e789af8b6c60e822fe7840efce3e9d832f08d1a7db7eb80ad36a282b95326813" }
                },
                icoName: null,
                modified: Date.now() - 1000 * 60 * 30 - 1000 * 60 * 60,
                size: 1e+8,
                additional: {
                    isPublic: true,
                    id: "",
                    game: null
                },
                status: MediaStatus.Uploaded
            },
            type: "clip",
            storageLoc: "local"
        }
    ]

    return <Grid
        {...props}
        justifyContent='start'
        alignItems='start'
        w='100%'
        gap='1em'
        templateColumns='repeat(auto-fill, minmax(21.5em,1fr))'
        className='videoGrid'
        overflowY='auto'
        p='5'
        pr='2'
        mr='4'
    >
        {items.map(e => <GeneralMediaItem key={`${e.info.mediaName}-${e.info.size}`} update={0} media={e} />)}
    </ Grid>
}