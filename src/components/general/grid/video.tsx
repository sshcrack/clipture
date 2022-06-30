import { Grid, GridItem, GridItemProps } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import ReactList from "react-list"
import { RenderLogger } from 'src/interfaces/renderLogger'
import "./video.css"

type BasicProps = Omit<GridItemProps, "onError"> & {
    children: React.ReactElement[] | React.ReactElement
    onClick?: (React.MouseEventHandler<HTMLDivElement>),
}

type VideoGridItem = (BasicProps & {
    type: "none"
}) | (BasicProps & {
    type: "videos" | "clips",
    fileName: string,
    onError?: () => void
})
type InputProps = {
    renderItem: (index: number, key: number | string) => JSX.Element,
    length: number
}

type MaxProps = Omit<GridItemProps, "onError"> & {
    type: "videos" | "clips",
    fileName: string,
    onError?: () => void

}

const log = RenderLogger.get("Components", "General", "Grid", "Video")
export function VideoGridItem({ background, onClick, children, ...rest }: VideoGridItem) {
    const [thumbnail, setThumbnail] = useState(undefined)
    const api = rest.type === "none" ? undefined : window.api[rest.type as "clips" | "videos"]
    useEffect(() => {
        if (thumbnail !== undefined || !api || rest.type === "none")
            return

        const { fileName } = rest
        if (!fileName)
            return setThumbnail(null)
        console.log("Getting thumbnail from", rest.type, "FileName", fileName)
        api.thumbnail(fileName)
            .then(e => setThumbnail(e))
            .catch(e => {
                log.error("Could not get thumbnail", e)
                setThumbnail(null)
                rest.onError()
            })
    }, [thumbnail])

    const props = { ...rest } as MaxProps
    delete props["type"]
    delete props["fileName"]
    delete props["key"]

    const type = rest.type
    const isLoading = thumbnail === undefined && type !== "none"
    let bg = background ?? ""
    if (thumbnail !== undefined)
        bg = `url("data:image/png;base64,${thumbnail}")`

    return <GridItem
        display='flex'
        minHeight='20em'
        height="20em"
        w='10em'
        className='videoGridItem'
        animation={isLoading ? "0.8s linear 0s infinite alternate none running backgroundSkeleton !important" : ""}
        background={bg}
        backgroundSize='cover'
        borderRadius="xl"
        flexDir='column'
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

export function VideoGrid({ renderItem, length }: InputProps) {

    return <Grid
        justifyContent='start'
        alignItems='start'
        w='100%'
        h='100%'
        gap='1em'
        templateColumns='repeat(auto-fill, minmax(21.5em,1fr))'
        className='videoGrid'
        overflowY='auto'
        p='5'
        pr='2'
        mr='4'
    >
        <ReactList
            itemRenderer={renderItem}
            length={length}
            type='uniform'
        />
    </Grid>
}