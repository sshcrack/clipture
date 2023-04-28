import { Flex, IconButton, Tooltip } from '@chakra-ui/react'
import React, { useContext } from "react"
import { BsArrowClockwise } from 'react-icons/bs'
import { FaPlay } from 'react-icons/fa'
import { EditorContext } from '../Editor'
export default function EditorBarButtons() {
    const { videoRef, selection, setPaused, setSelection, duration } = useContext(EditorContext)

    const playClip = () => {
        if (!videoRef?.current || !selection || !selection.end)
            return

        const { start, end } = selection
        const video = videoRef.current
        function checkTime() {
            if (video.currentTime >= end) {
                video.pause();
                return setPaused(video.paused)
            }

            setTimeout(checkTime, end - video.currentTime);
        }

        video.currentTime = start
        video.play()
        setPaused(false)
        checkTime()
    }

    const resetSelection = () => {
        setSelection({
            end: duration,
            start: 0,
            offset: 0,
            range: duration
        })
    }

    return <Flex
        flexDir='column'
        h='100%'
        alignItems='center'
        justifyContent='center'
        w='3em'
        pr='2'
    >
        <Tooltip label='Play Clip'>
            <IconButton
                h='100%'
                w='100%'
                onClick={() => playClip()}
                aria-label='play-clip'
                icon={<FaPlay />}
                colorScheme='green'
                borderBottomLeftRadius='0'
                borderBottomRightRadius='0'
            />
        </Tooltip>
        <Tooltip label='Reset'>
            <IconButton
                borderTopLeftRadius='0'
                borderTopRightRadius='0'
                h='100%'
                w='100%'
                onClick={() => resetSelection()}
                colorScheme='red'
                variant='solid'
                aria-label='reset-selection'
                icon={<BsArrowClockwise />}
            />
        </Tooltip>
    </Flex>
}