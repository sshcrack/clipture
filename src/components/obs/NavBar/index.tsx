import { SessionData } from '@backend/managers/auth/interfaces';
import { Button, Flex, Menu, Text } from '@chakra-ui/react';
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { AiOutlineCompass } from "react-icons/ai";
import { BsCameraReelsFill } from "react-icons/bs";
import { FaCog } from "react-icons/fa";
import { GoSignOut } from "react-icons/go";
import { SiApplearcade } from "react-icons/si";
import "src/components/obs/NavBar/styles.css";
import Preview from '../clips/preview';
import NavBarButton from './NavBarButton';

export function NavBar({ data }: { data: SessionData }) {
    const { image, name } = data.user
    const { auth, obs } = window.api
    const [recording, setRecording] = useState(() => window.api.obs.isRecording())
    const [recordDesc, setRecordDesc] = useState("Unknown")
    const computed = getComputedStyle(document.body)
    const brandPrimary = computed.getPropertyValue("--chakra-colors-brand-primary")
    const brandSecondary = computed.getPropertyValue("--chakra-colors-brand-secondary")

    console.log("primary", brandPrimary, brandSecondary)

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
                alignItems='center'
                flexDir='column'
                h='100%'
                w='100%'
                flex='.25'
            >
                <Flex
                    w='10em'
                    h='10em'
                >
                    {/*recording ? <Preview /> : null*/}
                </Flex>
                <Flex
                    flexDir='row'
                    alignItems='center'
                    justifyContent='space-between'
                    w='75%'
                    h='100%'
                >
                    <motion.div
                        animate={{
                            "--fillColor": recording ? "rgb(0, 255, 0)" : "rgb(255, 0, 0)",
                            scale: recording ? 1 : 0,
                            rotate: recording ? 0 : -180
                        } as any}
                        transition={{ type: "spring" }}
                    >
                        <BsCameraReelsFill style={{ fill: "var(--fillColor", width: "2em", height: "2em" }} />
                    </motion.div>

                    <motion.div
                        animate={{ "--textColor": recording ? "rgb(0,255,0)" : "rgb(255,0,0)" } as any}
                    >
                        <Text
                            style={{ color: "var(--textColor)" }}
                        >{recording ? recordDesc : "Not Recording"}</Text>
                    </motion.div>
                </Flex>

                <Flex
                    justifyContent='center'
                    alignItems='center'
                    w='100%'
                    h='100%'
                >
                    <motion.div
                        animate={{
                            "--color-primary": recording ? "rgba(0,0,0,0)" : brandPrimary,
                            "--color-secondary": recording ? "rgba(0,0,0,0)" : brandSecondary,
                        } as any}
                    >
                        <Button
                            className='navbar-record-button'
                            _hover={{ backgroundPosition: "100%" }}
                            onClick={() => {
                                if (!recording)
                                    obs.startRecording(true)
                                else
                                    obs.stopRecording(true)
                            }}
                        >{recording ? "Stop" : "Start"} Recording</Button>
                    </motion.div>
                </Flex>
            </Flex>
        </Menu >
    </Flex >
}