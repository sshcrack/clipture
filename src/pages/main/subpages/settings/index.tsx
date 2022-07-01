import { SessionData } from '@backend/managers/auth/interfaces'
import { Flex, Heading, Icon } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import React, { useEffect, useState } from "react"
import { FaCog } from 'react-icons/fa'
import { NavBar } from 'src/components/general/NavBar'

export default function SettingsPage({ data }: { data: SessionData }) {
    const [ recording, setRecording] = useState(false)
    const { obs } = window.api
    useEffect(() => {
        setRecording(obs.isRecording())
        return obs.onRecordChange(newRec => setRecording(newRec))
    }, [])
    return <Flex
        h='100%'
        w='100%'
    >
        <NavBar
            data={data}
            w='5em'
            h='100%'
        />
        <Flex
            w='100%'
            h='100%'
            justifyContent='center'
            alignItems='center'
            flexDir='column'
        >
            <Flex
                pt='5'
                w='100%'
                h='100%'
                flex='0'
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
            <Flex flex='1' h='100%' w='100%'>

            </Flex>
        </Flex>
    </Flex>
}