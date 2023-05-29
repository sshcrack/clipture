import { GeneralMediaInfo } from '@backend/managers/clip/new_interfaces'
import { Flex, GridItem } from '@chakra-ui/react'
import React, { useEffect, useState } from "react"
import { RenderLogger } from 'src/interfaces/renderLogger'
import MediaHeading from './heading'
import MediaFooter from './footer'

export type GeneralMediaProps = {
    media: GeneralMediaInfo,
    update: number
}

const log = RenderLogger.get("Dashboard", "Media", "Overview")
export default function GeneralMediaItem({ update, media }: GeneralMediaProps) {
    const { type, storageLoc, info } = media
    const { mediaName: clipName } = info

    const [thumbnailRaw, setThumbnail] = useState(undefined)
    const api = storageLoc === "cloud" ?
        window.api.cloud :
        window.api[type === "clip" ? "clips" : "videos"]

    useEffect(() => {
        setThumbnail(undefined)
    }, [update, clipName])

    useEffect(() => {
        if (thumbnailRaw !== undefined)
            return

        if (!clipName)
            return setThumbnail(null)

        console.log("Getting thumbnail from", type, "FileName", clipName)
        api.thumbnail(clipName)
            .then(e => {
                console.log("Setting thumbnail to", e.length)
                setThumbnail(e)
            })
            .catch(e => {
                log.error("Could not get thumbnail", e)
                setThumbnail(null)
            })
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore shush it does exists
    }, [thumbnailRaw])

    const isLoading = thumbnailRaw === undefined
    const thumbnail = thumbnailRaw && `url("data:image/png;base64,${thumbnailRaw}")`
    console.log("THumbnail is", thumbnail)

    return <GridItem
        display='flex'
        minHeight='22em'
        animation={isLoading ? "0.8s linear 0s infinite alternate none running backgroundSkeleton !important" : ""}
        rounded="2xl"
        flexDir='column'
        cursor='pointer'
        _hover={{
            filter: "drop-shadow(10px 2px 45px black)"
        }}
        style={{
            transition: "all .2s ease-out",
            background: "rgba(100, 100, 100, 0.5)"
        }}
    >
        <Flex
            w='100%'
            roundedTop="2xl"
            style={{ aspectRatio: "16 / 9", backgroundImage: thumbnail }}
            bgSize='contain'
            bgRepeat='no-repeat'
        >
        </Flex>
        <Flex
            w='100%'
            flex='1'
            roundedBottom="2xl"
            position='relative'
            overflow='hidden'
            _before={{
                content: '""',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                position: "absolute",
                backgroundRepeat: 'no-repeat',
                bgImage: thumbnail,
                bgSize: 'cover',
                roundedTop: '2xl',
                transform: 'scaleY(-1)',
                backgroundPosition: 'bottom'
            }}
        >
            <Flex
                w='100%'
                bg='rgba(33, 33, 33, 45%)'
                borderRadius='inherit'
                backdropFilter='auto'
                backdropBlur='27px'
                zIndex='1'
                flexDir='column'
                p='2'
                pb='1'
                pt='4'
            >
                <MediaHeading media={media} />
                <Flex flex='1' />
                <MediaFooter media={media} />
            </Flex>
        </Flex>
    </GridItem>
}