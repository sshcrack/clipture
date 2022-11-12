import { DiscoverClip } from '@backend/managers/cloud/interface'
import { Flex, Heading } from '@chakra-ui/react'
import { getCloudSourceUrl } from '@general/tools'
import { RenderGlobals } from '@Globals/renderGlobals'
import { default as React, useRef, useState, useEffect } from "react"
import GeneralSpinner from 'src/components/general/spinner/GeneralSpinner'
import BasicVideo from 'src/components/obs/videos/video/BasicVideo'

export type SingleItemProps = {
    item: DiscoverClip
}

export default function SingleItem({ item }: SingleItemProps) {
    const { title } = item

    const videoRef = useRef<HTMLVideoElement>(null)
    const [paused, setPaused] = useState(false)
    const [loading, setLoading] = useState(false)


    useEffect(() => {
        if (!videoRef?.current)
            return

        const curr = videoRef.current
        console.log("Loading new video...")
        curr.load()
        setLoading(true)

        curr.autoplay = true
        const offLoading = () => {
            setPaused(false)
            curr.play()
            curr.currentTime = 0;
        }

        const playingListener = () => {
            setLoading(false)
            console.log("Done loading")
        }
        curr.addEventListener("loadeddata", offLoading)
        curr.addEventListener("playing", playingListener)

        return () => {
            curr.removeEventListener("loadeddata", offLoading)
            curr.removeEventListener("playing", playingListener)
        }
    }, [videoRef, item])


    console.log("Item id", item.id, loading)
    return <Flex
        w='100%'
        h='100%'
        justifyContent='center'
        alignItems='center'
        flexDir='column'
    >
        <Heading>{title}</Heading>
        <BasicVideo
            paused={paused}
            setPaused={setPaused}
            videoRef={videoRef}
            source={getCloudSourceUrl(RenderGlobals.baseUrl, item.id)}
        >
            <Flex
                w='100%'
                h='100%'
                justifyContent='center'
                alignItems='center'
                gridRow='1'
                gridColumn='1'
                bg='rgba(0,0,0,0.5)'
                style={{ opacity: loading ? 1 : 0 }}
                transition='.2s opacity ease-in-out'
            >
                <GeneralSpinner loadingText='Loading...' />
            </Flex>
        </BasicVideo>
    </Flex>
}