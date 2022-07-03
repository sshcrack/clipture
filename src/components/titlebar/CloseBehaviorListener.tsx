import { useDisclosure, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, Button } from '@chakra-ui/react'
import React, { useEffect } from "react"
import { RenderLogger } from 'src/interfaces/renderLogger'

const log = RenderLogger.get("Components", "Titlebar", "CloseBehaviorListener")
export default function CloseBehaviorListener({ children }: React.PropsWithChildren) {
    const { system } = window.api
    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = React.useRef()

    const setBehavior = (behavior: "close" | "minimize") => {
        system.setCloseBehavior(behavior)
            .catch(log.error)
            .finally(() => {
                console.log("Closing curr window after setting behavior")
                system.closeCurrWindow()
            })
    }

    useEffect(() => {
        return system.addCloseAskListener(() => {
            console.log("Close Ask Listener received signal")
            onOpen()
        })
    }, [onOpen])
    return <>
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        Window Close Behavior
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        What do you want the close button to do?
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button
                            colorScheme='blue'
                            onClick={() => { onClose(); setBehavior("minimize") }}
                        >
                            Minimize App to tray
                        </Button>
                        <Button
                            colorScheme='red'
                            onClick={() => { onClose(); setBehavior("close") }}
                            ml={3}
                        >
                            Close App
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
        {children}
    </>
}