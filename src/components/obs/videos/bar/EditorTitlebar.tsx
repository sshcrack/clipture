import { Button, Flex, useToast } from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from "react"
import { BiPencil } from 'react-icons/bi'
import { GoChevronLeft } from 'react-icons/go'
import TitleBarItem from 'src/components/titlebar/TitleBarItem'
import { EditorContext } from '../Editor'

export default function EditorTitlebar() {
    const { selection, videoName } = useContext(EditorContext)
    const { start, end } = selection
    const [isCuttingClips, setCuttingClips] = useState(false)
    const [loading, setLoading] = useState(false)
    const { clips } = window.api
    const toast = useToast()

    console.log("Update titlebar")
    useEffect(() => {
        setLoading(true)
        clips.currently_cutting()
            .then((clips) => {
                const matching = clips.some(([, clip]) => {
                    const { info } = clip
                    console.log(info, videoName)
                    return info.videoName === videoName
                })
                setCuttingClips(matching)
            })
            .finally(() => {
                setLoading(false)
                console.log("Loading false")
            })
    }, [])

    const onBack = () => location.hash = "/clips"
    const generateClip = () => {
        if (isCuttingClips)
            return

        if (!end)
            return toast({
                title: "Invalid selection",
                status: "error",
                description: `Invalid selection from ${start}s to ${end}s`
            })

        console.log("Cutting with selection", selection)
        setCuttingClips(true)
        clips.cut(videoName, start, end, () => { })
            .then(() => setCuttingClips(false))
        onBack()
    }

    return <TitleBarItem>
        <Button
            leftIcon={<GoChevronLeft />}
            onClick={onBack}
            variant='outline'
            colorScheme='red'
            ml='2'
        >
            Exit Editor
        </Button>
        <Flex w='100%' />
        <Button
            leftIcon={<BiPencil />}
            variant='ghost'
            colorScheme='green'
            mr='2'
            onClick={() => generateClip()}
            loadingText={loading ? "Loading..." : "Saving..."}
            isLoading={loading || isCuttingClips}
        >
            Save & Share
        </Button>

    </TitleBarItem>
}