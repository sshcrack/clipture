import { SessionData } from '@backend/managers/auth/interfaces';
import { Button, Flex, Heading, Menu, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from "react";
import { AiOutlineCompass } from "react-icons/ai";
import { BsCameraReelsFill } from "react-icons/bs"
import { motion } from "framer-motion"
import { FaCog } from "react-icons/fa";
import { GoSignOut } from "react-icons/go";
import { SiApplearcade } from "react-icons/si";
import "src/components/obs/NavBar/styles.css";
import NavBarButton from './NavBarButton';

export function NavBar({ data }: { data: SessionData }) {
    const { image, name } = data.user
    const { auth, obs } = window.api
    const [recording, setRecording] = useState(false)
    const [recordDesc, setRecordDesc] = useState("Unknown")

    useEffect(() => {
        obs.onRecordChange(r => {
            setRecording(r)
            setRecordDesc(obs.recordDescription())
        })
    }, [])

    return <Flex
        flexDir='column'
        w='100%'
        h='100%'
        bg='gray.700'
        p='3'
        className='navbar'
    >
        <Menu>
            <Flex
                flex='.75'
                w='100%'
                h='100%'
                flexDir='column'
            >
                <NavBarButton
                    active={true}
                    icon={SiApplearcade}
                    text='Clips'
                    color='brand.secondary'
                />
                <NavBarButton
                    active={false}
                    icon={AiOutlineCompass}
                    text='Discover'
                    color='brand.primary'
                />
            </Flex>

            <Flex
                alignItems='center'
                flexDir='column'
                flex='0'
            >
                <NavBarButton
                    icon={FaCog}
                    active={false}
                    text='Settings'
                    color='gray.400'
                />
                <NavBarButton
                    active={false}
                    icon={GoSignOut}
                    text='Sign Out'
                    color='red.500'
                    onClick={() => auth.signOut()}
                />
            </Flex>
            <Flex
                justifyContent='center'
                alignItems='center'
                flexDir='column'
                h='100%'
                w='100%'
                flex='.25'
            >
                <Flex>
                    <motion.div
                        animate={{ "--fillColor": recording ? "rgb(0, 255, 0)" : "rgb(255, 0, 0)", scale: recording ? 1 : 0 } as any}
                        transition={{ type: "spring" }}
                    >
                        <BsCameraReelsFill style={{ fill: "var(--fillColor" }} />
                    </motion.div>
                    <motion.div
                        animate={{ "--textColor": recording ? "rgb(0,255,0)" : "rgb(255,0,0)" } as any}
                    >
                        <Text
                            style={{ color: "var(--textColor)" }}
                        >{recording ? recordDesc : "Not Recording"}</Text>
                    </motion.div>
                </Flex>
                <Button onClick={() => {
                    if (!recording)
                        obs.startRecording()
                    else
                        obs.stopRecording()
                }}>{recording ? "Stop" : "Start"} Recording</Button>
            </Flex>
        </Menu>
    </Flex>
}