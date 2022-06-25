import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, useDisclosure } from '@chakra-ui/react';
import React, { PropsWithChildren, useState } from "react";
import { ContextMenu } from './base/ContextMenu';
import { ContextMenuItem } from './base/ContextMenuItem';
import { ContextMenuList } from './base/ContextMenuList';
import { ContextMenuTrigger } from './base/ContextMenuTrigger';

type Props = {
    clipName: string,
    clipPath: string
}

export default function ClipContextMenu({ children, clipName, clipPath }: PropsWithChildren<Props>) {
    const { clips, system } = window.api
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [isDeleting, setDeleting] = useState(false)
    const cancelRef = React.useRef()

    return <><ContextMenu>
        <ContextMenuTrigger>
            {children}
        </ContextMenuTrigger>
        <ContextMenuList>
            <ContextMenuItem onClick={() => system.open_folder(clipPath)}>Show in Explorer</ContextMenuItem>
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
                        Delete Clip
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        Are you sure? The clip will be deleted forever.
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
                                clips.delete(clipName)
                                    .finally(() => setDeleting(false))
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