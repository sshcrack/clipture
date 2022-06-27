import { Button, Flex, FormControl, FormErrorMessage, FormHelperText, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, useToast } from '@chakra-ui/react'
import React, { ChangeEvent, useContext, useEffect, useState } from "react"
import { BiPencil } from 'react-icons/bi'
import { GoChevronLeft } from 'react-icons/go'
import TitleBarItem from 'src/components/titlebar/TitleBarItem'
import { useDebounce } from 'use-debounce'
import { EditorContext } from '../Editor'

export default function EditorTitlebar() {
    const { selection, videoName } = useContext(EditorContext)
    const { start, end } = selection
    const [isCuttingClips, setCuttingClips] = useState(false)
    const [clipExists, setClipExists] = useState(false)

    const [desiredClipName, setDesiredClipName] = useState("")
    const [debouncedClipName] = useDebounce(desiredClipName, 100)

    const { isOpen, onOpen, onClose } = useDisclosure()
    const [loading, setLoading] = useState(false)
    const { clips } = window.api
    const toast = useToast()

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

    const onBack = () => location.hash = "/"
    const generateClip = () => {
        if (isCuttingClips || isError)
            return

        if (!end)
            return toast({
                title: "Invalid selection",
                status: "error",
                description: `Invalid selection from ${start}s to ${end}s`
            })

        clips.exists(desiredClipName)
            .then(exists => {
                if (exists) {
                    setClipExists(true)
                    return toast({
                        title: "Clip Name invalid",
                        description: "A clip with that name exists already.",
                        status: "error"
                    })
                }
                console.log("Cutting with selection", selection)
                setCuttingClips(true)
                onClose()
                clips.cut(desiredClipName, videoName, start, end, () => { })
                    .then(() => setCuttingClips(false))
                onBack()
            })
    }

    useEffect(() => {
        let shouldSet = true
        clips.exists(debouncedClipName)
            .then(e => {
                if (!shouldSet)
                    return
                setClipExists(e)
            })

        return () => {
            shouldSet = false
        }
    }, [debouncedClipName])

    const isEmpty = desiredClipName === ''
    const filenameValid = /^([\w,\s-]|-|_)+$/.test(desiredClipName)
    const isError = isEmpty || !filenameValid || clipExists
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => setDesiredClipName(e.target.value)

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
            onClick={onOpen}
            loadingText={loading ? "Loading..." : "Saving..."}
            isLoading={loading || isCuttingClips}
        >
            Save & Share
        </Button>

        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Save & Share</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl isRequired isInvalid={isError}>
                        <FormLabel htmlFor='clip-name'>Clip Name</FormLabel>
                        <Input
                            id='clip-name'
                            placeholder='Clip Name'
                            onChange={handleInputChange}
                            value={desiredClipName}
                            autoFocus
                        />
                        {!isError ? (
                            <FormHelperText>
                                Enter how the clip should be named
                            </FormHelperText>
                        ) : (
                            <FormErrorMessage>{
                                clipExists ?
                                    "Clip Name exists already" :
                                    isEmpty ?
                                        "Clip Name cannot be empty" : "Clip Name can only contain letters, whitespaces and numbers"
                            }</FormErrorMessage>
                        )}
                    </FormControl>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme='green' mr={3} onClick={generateClip}>
                        Save & Share
                    </Button>
                    <Button variant='ghost' onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </TitleBarItem>
}