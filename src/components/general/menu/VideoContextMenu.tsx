import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, useDisclosure, useToast } from '@chakra-ui/react';
import React, { PropsWithChildren, useState } from "react";
import { ReactSetState } from 'src/types/reactUtils';
import { ContextMenu } from './base/ContextMenu';
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
                <ContextMenuItem onClick={() => system.open_clip(videoName)}>Show in Explorer</ContextMenuItem>
                <ContextMenuItem colorScheme='red' onClick={onOpen}>Delete</ContextMenuItem>
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
                                clips.delete(videoName)
                                    .then(() => toast({ title: "Deleted video", status: "success" }))
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