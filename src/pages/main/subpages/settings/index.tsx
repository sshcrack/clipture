import { SessionData } from '@backend/managers/auth/interfaces'
import { Flex, Heading, Icon, IconButton, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import React, { useEffect, useState } from "react"
import { AiOutlineClose, AiOutlineCloseCircle } from 'react-icons/ai'
import { FaCog } from 'react-icons/fa'
import { useParams } from 'react-router-dom'
import SettingsMenu from 'src/components/settings/navbar/SettingsMenu'

export default function SettingsPage({ prevPage }: { data: SessionData, prevPage: string }) {
    const { item } = useParams()
    const [recording, setRecording] = useState(false)
    const { obs } = window.api

    useEffect(() => {
        setRecording(obs.isRecording())
        return obs.onRecordChange(newRec => setRecording(newRec))
    }, [])
    return <Flex
        h='100%'
        w='100%'
    >
        <Flex
            w='100%'
            h='100%'
            justifyContent='center'
            alignItems='center'
            flexDir='column'
        >
            <Flex
                pt='5'
                pr='5'
                w='100%'
                h='100%'
                flex='0'
                justifyContent='center'
                alignItems='center'
            >
                <Flex
                    w='100%'
                    h='100%'
                    flex='1'
                    justifyContent='center'
                    alignItems='center'
                >
                    <motion.div
                        style={{
                            width: "var(--chakra-space-10)",
                            height: "var(--chakra-space-10)",
                            marginRight: "var(--chakra-space-3)",
                            transform: "rotate(0deg)"
                        }}
                        animate={{
                            transform: "rotate(360deg)"
                        }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 10
                        }}
                    >
                        <Icon as={FaCog} w='100%' h='100%' />
                    </motion.div>
                    <Heading>Settings</Heading>
                </Flex>
                <IconButton
                    rounded='full'
                    flex='0'
                    aria-label='Close'
                    colorScheme='red'
                    icon={<AiOutlineClose />}
                    onClick={() => location.hash = prevPage}
                />
            </Flex>
            <Flex flex='1' h='100%' w='100%'>
                <SettingsMenu />
                <Flex
                    flex='1 1 800px'
                    h='100%'
                    w='100%'
                >
                    <Text>{item ?? "General"}</Text>
                </Flex>
            </Flex>
        </Flex>
    </Flex>
}