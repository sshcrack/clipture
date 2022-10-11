import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, useDisclosure, useToast } from '@chakra-ui/react';
import React, { PropsWithChildren, useState } from "react";
import { useTranslation } from 'react-i18next';
import { ReactSetState } from 'src/types/reactUtils';
import { ContextMenu } from './base/ContextMenu';
import { ContextMenuItem } from './base/ContextMenuItem';
import { BsTrashFill } from "react-icons/bs"
import { AiFillFolderOpen, AiOutlineCloudUpload } from "react-icons/ai"
import { ContextMenuList } from './base/ContextMenuList';
import { ContextMenuTrigger } from './base/ContextMenuTrigger';
import { ContextMenuCategory } from './base/ContextMenuCategory';
import { RenderLogger } from 'src/interfaces/renderLogger';

type Props = {
    clipName: string,
    setUpdate: ReactSetState<number>,
    setOpen?: ReactSetState<boolean>,
    uploaded: boolean,
    cloudDisabled: boolean
}

const log = RenderLogger.get("Components", "ClipContextMenu")
export default function ClipContextMenu({ children, clipName, setUpdate, setOpen, uploaded, cloudDisabled }: PropsWithChildren<Props>) {
    const { clips, system, cloud } = window.api
    const { t } = useTranslation("general", { keyPrefix: "menu.context_menu" })

    const { isOpen, onOpen, onClose } = useDisclosure()
    const [isDeleting, setDeleting] = useState(false)
    const [isUploading, setUploading] = useState(false)
    const [isCloudDeleting, setCloudDeleting] = useState(false)

    const cancelRef = React.useRef()
    const toast = useToast()

    console.log("Uploaded", uploaded, cloudDisabled)
    return <><ContextMenu setOpen={setOpen}>
        <ContextMenuTrigger>
            {children}
        </ContextMenuTrigger>
        <ContextMenuList>
            <ContextMenuCategory>Local</ContextMenuCategory>
            <ContextMenuItem
                onClick={() => system.open_clip(clipName)}
                leftIcon={<AiFillFolderOpen />}
            >{t("show_folder")}</ContextMenuItem>
            <ContextMenuItem
                colorScheme='red'
                onClick={onOpen}
                leftIcon={<BsTrashFill />}
            >{t("delete")}</ContextMenuItem>
            <ContextMenuCategory>Cloud</ContextMenuCategory>
            <ContextMenuItem
                isDisabled={cloudDisabled || uploaded}
                colorScheme='green'
                leftIcon={<AiOutlineCloudUpload />}
                isLoading={isUploading}
                onClick={() => {
                    cloud.upload(clipName.replace(".clipped.mp4", ""))
                        .catch(e => {
                            log.error(e)
                            toast({
                                status: "error",
                                title: "Could not upload clip",
                                description: e?.stack ?? e,
                                duration: 4000
                            })
                        })
                        .finally(() => {
                            setUploading(false)
                            setUpdate(Math.random())
                        })
                }}
            >{t("upload")}</ContextMenuItem>
            <ContextMenuItem
                isDisabled={cloudDisabled || isCloudDeleting || !uploaded}
                colorScheme='red'
                isLoading={isCloudDeleting}
                onClick={() => {
                    setCloudDeleting(true)
                    cloud.deleteClip(clipName.replace(".clipped.mp4", ""))
                        .catch(e => {
                            log.error(e)
                            toast({
                                status: "error",
                                title: "Could not delete clip",
                                description: e?.stack ?? e,
                                duration: 4000
                            })
                        })
                        .finally(() => {
                            console.log("Sending update to outer")
                            setUpdate(Math.random())
                            setCloudDeleting(false)
                        })
                }}
                leftIcon={<BsTrashFill />}
            >{t("delete")}</ContextMenuItem>
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
                                clips.delete(clipName)
                                    .then(() => toast({ title: t("deleted"), status: "success" }))
                                    .finally(() => {
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