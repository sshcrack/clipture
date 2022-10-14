import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, useDisclosure, useToast } from '@chakra-ui/react';
import React, { PropsWithChildren, useContext, useState } from "react";
import { useTranslation } from 'react-i18next';
import { AiFillFolderOpen } from "react-icons/ai";
import { BsTrashFill } from "react-icons/bs";
import { ReactSetState } from 'src/types/reactUtils';
import { SelectionContext } from '../info/SelectionProvider';
import { ContextMenu } from './base/ContextMenu';
import { ContextMenuCategory } from './base/ContextMenuCategory';
import { ContextMenuItem } from './base/ContextMenuItem';
import { ContextMenuList } from './base/ContextMenuList';
import { ContextMenuTrigger } from './base/ContextMenuTrigger';

type Props = {
    videoName: string,
    setUpdate: ReactSetState<number>,
    setOpen?: ReactSetState<boolean>
}

export default function VideoContextMenu({ children, videoName, setUpdate, setOpen }: PropsWithChildren<Props>) {
    const { clips, system } = window.api
    const { selection } = useContext(SelectionContext)
    const { t } = useTranslation("general", { keyPrefix: "menu.context_menu" })
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [isDeleting, setDeleting] = useState(false)
    const cancelRef = React.useRef()
    const toast = useToast()

    return <>
        <ContextMenu setOpen={setOpen}>
            <ContextMenuTrigger>
                {children}
            </ContextMenuTrigger>
            <ContextMenuList>
                <ContextMenuCategory>{t("local")}</ContextMenuCategory>
                <ContextMenuItem
                    onClick={() => system.open_clip(videoName)}
                    leftIcon={<AiFillFolderOpen />}
                >{t("show_folder")}</ContextMenuItem>
                <ContextMenuItem
                    colorScheme='red' onClick={onOpen}
                    leftIcon={<BsTrashFill />}
                >{selection?.length > 0 ? t("delete_selected") : t("delete")}</ContextMenuItem>
            </ContextMenuList>
        </ContextMenu>
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        Delete Video
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        Are you sure? The video will be deleted forever.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme='red'
                            isLoading={isDeleting}
                            onClick={() => {
                                setDeleting(true)
                                const toDelete = !!selection && selection.length > 0 ? selection : [ videoName ]

                                const proms = Promise.all(toDelete.map(e => clips.delete(e)))
                                proms
                                    .then(() => toast({ title: t("deleted"), status: "success" }))
                                    .finally(() => {
                                        setDeleting(false)
                                        setUpdate(Math.random())
                                    })
                                onClose()
                            }} ml={3}>
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>
}