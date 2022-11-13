import { DiscoverClip } from '@backend/managers/cloud/interface'
import { Flex } from '@chakra-ui/react'
import { default as React, useEffect, useRef } from "react"
import VideoSingleItem from './Video'

export type SingleItemProps = {
    item: DiscoverClip
}

export default function SingleItem({ item }: SingleItemProps) {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (!videoRef?.current)
            return

        const curr = videoRef.current
        console.log("Loading new video...")
        curr.load()

        curr.autoplay = true
        const offLoading = () => {
            curr.play()
            curr.currentTime = 0;
        }
        curr.addEventListener("loadeddata", offLoading)

        return () => curr?.removeEventListener("loadeddata", offLoading)
    }, [videoRef, item])

    return <Flex
        w='100%'
        h='100%'
        justifyContent='center'
        alignItems='center'
        flexDir='column'
    >
        <VideoSingleItem item={item} />
    </Flex>
}