import { Button, Flex, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure } from '@chakra-ui/react'
import React, { useEffect, useState } from "react"
import { useTranslation } from 'react-i18next'
import { IOBSOutputSignalInfo } from 'src/types/obs/obs-studio-node'

export default function RecordErrorListener() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { t } = useTranslation("obs", { keyPrefix: "error" })
    const [err, setErr] = useState(null as IOBSOutputSignalInfo)

    useEffect(() => {
        window.api.obs.onRecordError(e => {
            onOpen()
            console.error("Record error", e)
            setErr(e as IOBSOutputSignalInfo)
        })
    }, [])

    const unknownError = <Flex>
        <Text>{t("unknown")}</Text>
    </Flex>

    const specificErr = err?.code ? <>
        <Text>"{err.error}"</Text>
        <br />
        <br />
        <Text>Your nvidia/amd card drivers are probably not installed.</Text>
        <Text>Install:</Text>
        <Flex w='100%' justifyContent='space-around' alignItems='center'>
            <Button colorScheme='yellow' onClick={() => window.api.system.openDriverPage("nvidia")}>Nvidia</Button>
            <Button colorScheme='yellow' onClick={() => window.api.system.openDriverPage("amd")}>AMD</Button>
        </Flex>
        <br />
        <br />
        <Text>Please restart your computer after installing the video drivers.</Text>

    </> : <></>

    return <>
        <Modal isOpen={isOpen} onClose={onClose} size='xl'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{t("title")}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Flex w='100%' h='100%' justifyContent='space-around' alignItems='center'>
                        <Image
                            src={"../assets/illustrations/error.gif"}
                            w='15em'
                            h='15em'
                            flex='0'
                            filter="drop-shadow(2px 4px 20px red)"
                        />
                        <Flex justifyContent='center' alignItems='center' flexDir='column' h='100%' w='100%'>
                            {err?.code ? specificErr : unknownError}
                        </Flex>
                    </Flex>
                </ModalBody>
                <ModalFooter>
                    <Text mr='auto'>Code: {err?.code ?? "unknown"}</Text>
                    <Button colorScheme='blue' mr={3} onClick={onClose}>
                        {t("close")}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>
}