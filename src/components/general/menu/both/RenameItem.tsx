import { Button, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, useToast } from '@chakra-ui/react'
import React, { useRef, useState } from "react"
import { useTranslation } from 'react-i18next'
import { CgRename } from "react-icons/cg"
import { RenderLogger } from 'src/interfaces/renderLogger'
import { ReactSetState } from 'src/types/reactUtils'
import NameValidator from '../../validator/nameValidator'
import { ContextMenuItem } from '../base/ContextMenuItem'

type Props = {
    baseName: string,
    type: "videos" | "clips",
    uploaded?: boolean,
    setUpdate: ReactSetState<number>
}

const log = RenderLogger.get("Menu", "Both", "RenameItem")
export default function RenameItem({ baseName, type, uploaded, setUpdate }: Props) {
    const [isRenaming, setRenaming] = useState(false)
    const [isError, setError ] = useState(true)
    const [ desiredClipName, setDesiredClipName ] = useState(baseName.replace(".clipped.mp4", ""))

    const { clips, videos, cloud } = window.api
    const { t } = useTranslation("general", { keyPrefix: "menu.context_menu" })
    const { onClose, isOpen, onOpen } = useDisclosure()
    const initialRef = useRef()
    const toast = useToast()

    return <>
        <ContextMenuItem
            colorScheme='yellow'
            isLoading={isRenaming}
            onClick={onOpen}
            leftIcon={<CgRename />}
        >{t("rename")}</ContextMenuItem>

        <Modal
            initialFocusRef={initialRef}
            isOpen={isOpen}
            onClose={onClose}
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Create your account</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <NameValidator
                        isError={isError}
                        setError={setError}

                        desiredClipName={desiredClipName}
                        setDesiredClipName={setDesiredClipName}

                        texts={{
                            error: {
                                exists: t("dialog.input.exists"),
                                empty: t("dialog.input.empty"),
                                invalid_characters: t("dialog.input.invalid_characters")
                            },
                            input: {
                                placeholder: t("dialog.input.clip_name"),
                                label: t("dialog.input.clip_name")
                            },
                            helper_text: t("dialog.input.clip_name_prompt")
                        }}
                    />
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme='green' mr={3} onClick={() => {
                        if(isError)
                            return

                        const method = type === "videos" ? videos : clips
                        const filtered = baseName.split(".clipped.mp4").join("")
                        const proms = Promise.all([
                            method.rename(filtered, desiredClipName),
                            type === "clips" && uploaded ? cloud.rename(filtered, desiredClipName) : Promise.resolve()
                        ])
                        setRenaming(true)
                        proms
                        .catch(e => {
                            log.error(e)
                            toast({
                                title: "Error",
                                status: "error",
                                description: "Could not rename clip"
                            })
                        })
                        .finally(() => {
                            setRenaming(false)
                            onClose()
                            setUpdate(Math.random())
                        })
                    }}>
                        {t("rename")}
                    </Button>
                    <Button onClick={onClose}>{t("dialog.cancel")}</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>

}