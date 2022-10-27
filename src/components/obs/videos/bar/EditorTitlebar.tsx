import { Button, Flex, FormControl, FormErrorMessage, FormHelperText, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, useToast } from '@chakra-ui/react'
import React, { ChangeEvent, useContext, useEffect, useState } from "react"
import { useTranslation } from 'react-i18next'
import { BiPencil } from 'react-icons/bi'
import { GoChevronLeft } from 'react-icons/go'
import NameValidator from 'src/components/general/validator/nameValidator'
import TitleBarItem from 'src/components/titlebar/TitleBarItem'
import { useDebounce } from 'use-debounce'
import { EditorContext } from '../Editor'

export default function EditorTitlebar() {
    const { selection, videoName } = useContext(EditorContext)
    const { start, end } = selection
    const [isCuttingClips, setCuttingClips] = useState(false)

    const [desiredClipName, setDesiredClipName] = useState("")

    const [isError, setError] = useState(true)

    const { isOpen, onOpen, onClose } = useDisclosure()
    const [loading, setLoading] = useState(false)
    const { clips } = window.api
    const { t } = useTranslation("editor", { keyPrefix: "titlebar" })

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

    const onBack = () => history.back()
    const generateClip = () => {
        if (isCuttingClips || isError)
            return

        if (!end)
            return toast({
                title: t("generate.no_end.title"),
                status: "error",
                description: t("generate.no_end.description", { start, end })
            })

        clips.exists(desiredClipName)
            .then(exists => {
                if (exists)
                    return toast({
                        title: t("generate.name_invalid.title"),
                        description: t("generate.name_invalid.description"),
                        status: "error"
                    })

                console.log("Cutting with selection", selection)
                setCuttingClips(true)
                onClose()
                clips.cut(desiredClipName, videoName, start, end, () => { })
                    .then(() => setCuttingClips(false))
                location.href='#/clips'
            })
    }

    return <TitleBarItem>
        <Button
            leftIcon={<GoChevronLeft />}
            onClick={onBack}
            variant='outline'
            colorScheme='red'
            ml='2'
        >
            {t("exit")}
        </Button>
        <Flex w='100%' />
        <Button
            leftIcon={<BiPencil />}
            variant='ghost'
            colorScheme='green'
            mr='2'
            onClick={onOpen}
            loadingText={loading ? t("loading") : t("saving")}
            isLoading={loading || isCuttingClips}
        >
            {t("save_share")}
        </Button>

        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{t("save_dialog.title")}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <NameValidator
                        isError={isError}
                        setError={setError}

                        desiredClipName={desiredClipName}
                        setDesiredClipName={setDesiredClipName}

                        texts={{
                            error: {
                                exists: t("save_dialog.exists"),
                                empty: t("save_dialog.empty"),
                                invalid_characters: t("save_dialog.invalid_characters")
                            },
                            input: {
                                placeholder: t("save_dialog.clip_name"),
                                label: t("save_dialog.clip_name")
                            },
                            helper_text: t("save_dialog.clip_name_prompt")
                        }}
                    />
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme='green' mr={3} onClick={generateClip}>
                        {t("save_share")}
                    </Button>
                    <Button variant='ghost' onClick={onClose}>{t("save_dialog.cancel")}</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </TitleBarItem>
}