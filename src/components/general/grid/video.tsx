import { Grid, GridItem, GridItemProps, GridProps } from '@chakra-ui/react'
import React, { MutableRefObject, useEffect, useRef, useState } from 'react'
import { RenderLogger } from 'src/interfaces/renderLogger'
import { ReactSetState } from 'src/types/reactUtils'
import "./video.css"

type BasicProps = Omit<GridItemProps, "onError"> & {
    children: React.ReactElement[] | React.ReactElement
    onClick?: (React.MouseEventHandler<HTMLDivElement>),
    update: number
}

type VideoGridItem = (BasicProps & {
    type: "none"
}) | (BasicProps & {
    type: "videos" | "clips",
    fileName: string,
    onError?: () => void
})

type MaxProps = Omit<GridItemProps, "onError"> & {
    type: "videos" | "clips",
    fileName: string

}

export type VideoGridState = {
    gridRef: MutableRefObject<HTMLDivElement>,
    cachedDurations: Map<string, number>,
    setCachedDurations: ReactSetState<Map<string, number>>
}
export const VideoGridContext = React.createContext<VideoGridState>({
    gridRef: null,
    cachedDurations: new Map(),
    setCachedDurations: () => { }
})

const log = RenderLogger.get("Components", "General", "Grid", "Video")
export function VideoGridItem({ update, background, onClick, children, ...rest }: VideoGridItem) {
    const [thumbnail, setThumbnail] = useState(undefined)
    const api = rest.type === "none" ? undefined : (rest.fileName.startsWith("cloud#") ? window.api.cloud : window.api[rest.type as "clips" | "videos"])

    useEffect(() => {
        setThumbnail(undefined)
        //@ts-ignore it exists shush
    }, [update, rest["fileName"]])

    useEffect(() => {
        if (thumbnail !== undefined || !api || rest.type === "none")
            return

        const { fileName } = rest
        if (!fileName || fileName.startsWith("cloud#"))
            return setThumbnail(null)

        console.log("Getting thumbnail from", rest.type, "FileName", fileName)
        api.thumbnail(fileName.replace("cloud#", ""))
            .then(e => setThumbnail(e))
            .catch(e => {
                log.error("Could not get thumbnail", e)
                setThumbnail(null)
            })
        //@ts-ignore shush it does exists
    }, [thumbnail])

    const props = { ...rest } as MaxProps
    delete props["type"]
    delete props["fileName"]
    delete props["key"]

    const type = rest.type
    const isLoading = thumbnail === undefined && type !== "none"
    let bg = background ?? "brand.bg"
    if (thumbnail !== undefined)
        bg = `url("data:image/png;base64,${thumbnail}")`

    return <GridItem
        display='flex'
        minHeight='20em'
        className='videoGridItem'
        animation={isLoading ? "0.8s linear 0s infinite alternate none running backgroundSkeleton !important" : ""}
        backgroundSize='cover'
        rounded="2xl"
        flexDir='column'
        bg={bg}
        cursor='pointer'
        _hover={{
            filter: " drop-shadow(10px 2px 45px black)",
            transform: "scale(1.0125)"
        }}
        style={{
            transition: "all .2s ease-out"
        }}
        onClick={onClick ?? undefined}
        {...props}
    >
        {children}
    </GridItem>
}

export function VideoGrid({ children, forwardRef, ...props }: GridProps & { forwardRef?: MutableRefObject<HTMLDivElement> }) {
    const gridRef = useRef<HTMLDivElement>(null)
    const [cachedDurations, setCachedDurations] = useState(new Map<string, number>())

    return <VideoGridContext.Provider
        value={{ gridRef, cachedDurations, setCachedDurations }}
    >
        <Grid
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
            ref={gridRef}
        >
            {children}
        </ Grid>
    </VideoGridContext.Provider>
}