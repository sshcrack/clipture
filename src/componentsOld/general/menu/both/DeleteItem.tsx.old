import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, useDisclosure, useToast } from '@chakra-ui/react'
import React, { useContext, useState } from "react"
import { useTranslation } from 'react-i18next'
import { BsTrashFill } from 'react-icons/bs'
import { ReactSetState } from 'src/types/reactUtils'
import { SelectionContext } from '../../info/SelectionProvider'
import { ContextMenuItem } from '../base/ContextMenuItem'

export default function DeleteItem({ baseName, setUpdate }: { baseName: string, setUpdate: ReactSetState<number> }) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [isDeleting, setDeleting] = useState(false)
    const { selection, setSelection } = useContext(SelectionContext)
    const { clips } = window.api
    const { t } = useTranslation("general", { keyPrefix: "menu.context_menu" })

    const toast = useToast()
    const cancelRef = React.useRef()
    return <>
        <ContextMenuItem
            colorScheme='red'
            onClick={onOpen}
            leftIcon={<BsTrashFill />}
        >{selection?.length > 0 ? t("delete_selected") : t("delete")}</ContextMenuItem>
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        {t("dialog.title")}
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        {t("dialog.body")}
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                            {t("dialog.cancel")}
                        </Button>
                        <Button
                            colorScheme='red'
                            isLoading={isDeleting}
                            onClick={() => {
                                setDeleting(true)
                                const toDelete = !!selection && selection.length > 0 ? selection : [baseName]

                                const proms = Promise.all(toDelete.map(e => clips.delete(e)))
                                proms
                                    .then(() => toast({ title: t("deleted"), status: "success" }))
                                    .finally(() => {
                                        setSelection([])
                                        setDeleting(false)
                                        setUpdate(Math.random())
                                    })
                                onClose()
                            }} ml={3}>
                            {t("delete")}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>

}