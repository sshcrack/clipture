import { GridItemProps } from '@chakra-ui/react'
import { getVideoSourceUrl } from '@general/tools'
import React, { useContext, useEffect, useState } from "react"
import { RenderLogger } from 'src/interfaces/renderLogger'
import { EditorContext } from './Editor'
import BasicVideo from './video/BasicVideo'

const log = RenderLogger.get("components", "obs", "videos", "EditorVideo")
export default function EditorVideo(props: GridItemProps) {
    const { bgGeneratorRef, videoRef, videoName, setDuration, paused, setSelection, setPaused } = useContext(EditorContext)

    useEffect(() => {
        if (!videoRef?.current)
            return

        const video = videoRef.current
        video.onloadeddata = async () => {
            await new Promise<void>(resolve => {
                if (video.duration !== Infinity)
                    return resolve()

                video.ondurationchange = () => {
                    if (video.duration === Infinity)
                        return

                    return resolve();
                }

                video.load()
                video.currentTime = 1e101
                video.play()
            });

            const duration = video.duration
            const selection = {
                end: duration,
                offset: 0,
                range: duration,
                start: 0
            }

            log.log("Setting selection to", selection)
            setDuration(duration)
            setSelection(selection)
            setPaused(false)
            video.currentTime = 0
            video.play()
        }
    }, [videoRef, setSelection, setDuration])

    return <BasicVideo
        setPaused={setPaused}
        paused={paused}
        videoRef={videoRef}
        bgGeneratorRef={bgGeneratorRef}
        source={getVideoSourceUrl(videoName)}
        {...props}
    >
        {props.children}
    </BasicVideo>
}