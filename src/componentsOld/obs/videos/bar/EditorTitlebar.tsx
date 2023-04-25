import { Button, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure, useToast } from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from "react"
import { useTranslation } from 'react-i18next'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'
import { BiPencil } from 'react-icons/bi'
import { GoChevronLeft } from 'react-icons/go'
import { components, OptionProps } from 'react-select'
import NameValidator from 'src/componentsOld/general/validator/nameValidator'
import CustomSelect from 'src/componentsOld/settings/categories/Game/List/CustomSelect'
import TitleBarItem from 'src/components/titlebar/TitleBarItem'
import { EditorContext } from '../Editor'

const { Option } = components;
function IconOption(props: OptionProps) {
    const data = props.data as { [key: string]: any }

    return <Option {...props}>
        <Flex w='100%' justifyContent='center' alignItems='center' gap='2'>
            {data.icon}
            {data.label}
        </Flex>

    </Option>
}


export default function EditorTitlebar() {
    const { selection, videoName } = useContext(EditorContext)
    const { start, end } = selection
    const [isCuttingClips, setCuttingClips] = useState(false)

    const [desiredClipName, setDesiredClipName] = useState("")

    const [isError, setError] = useState(true)
    const [isPublic, setPublic] = useState(true)

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
    const generateClip = (shouldUpload: boolean) => {
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
                clips.cut({
                    clipName: desiredClipName,
                    videoName,
                    start,
                    end
                }, () => {/**/ }, {
                    upload: shouldUpload,
                    isPublic
                })
                    .then(() => setCuttingClips(false))
                location.href = '#/clips'
            })
    }

    const options = [
        {
            label: t("save_dialog.visibility.private"),
            value: "private",
            icon: <AiFillEyeInvisible />
        },
        {
            label: t("save_dialog.visibility.public"),
            value: "public",
            icon: <AiFillEye />
        }
    ]

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
                    <Flex
                        justifyContent='center'
                        alignItems='center'
                        w='100%'
                        gap='9'
                    >
                        <Text>{t("save_dialog.visibility.name")}</Text>
                        <CustomSelect
                            components={{
                                Option: IconOption, SingleValue: (e) => {
                                    const data = e.data as typeof options[0]
                                    return <Flex
                                        w='100%'
                                        alignItems='center'
                                        gap='2'
                                        justifyContent='left'
                                        ml='2px'
                                        mr='2px'
                                        gridArea='1/1/2/3'
                                    >
                                        {data.icon}
                                        {data.label}
                                    </Flex>
                                }
                            }}
                            value={options.find(e => e.value === (isPublic ? "public" : "private"))}
                            onChange={(e: typeof options[0]) => setPublic(e.value === "public")}
                            options={options}
                        />
                    </Flex>
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
                    <Button colorScheme='green' mr={3} onClick={() => generateClip(false)}>
                        {t("save")}
                    </Button>
                    <Button colorScheme='green' mr={3} onClick={() => generateClip(true)}>
                        {t("save_share")}
                    </Button>
                    <Button variant='ghost' onClick={onClose}>{t("save_dialog.cancel")}</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </TitleBarItem>
}