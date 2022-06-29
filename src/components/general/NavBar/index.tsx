import { SessionData } from '@backend/managers/auth/interfaces';
import { Flex, FlexProps, Menu } from '@chakra-ui/react';
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { AiFillCamera, AiOutlineCompass } from "react-icons/ai";
import { FaCog } from "react-icons/fa";
import { GoSignOut } from "react-icons/go";
import { SiApplearcade } from "react-icons/si";
import NavBarButton from './NavBarButton';
import "src/components/general/Navbar/index.css"

export function NavBar({ data, ...props }: { data: SessionData } & FlexProps) {
    const { auth, obs } = window.api
    const [recording, setRecording] = useState(() => window.api.obs.isRecording())
    const [recordDesc, setRecordDesc] = useState("Unknown")

    useEffect(() => {
        return obs.onRecordChange(r => {
            setRecording(r)
            setRecordDesc(obs.recordDescription())
        })
    }, [])

    return <Flex
        flexDir='column'
        bg="brand.bg"
        w='100%'
        {...props}
    >
        <Menu>
            <Flex
                flex='1'
                w='100%'
                h='100%'
                flexDir='column'
                alignItems='center'
            >
                <NavBarButton
                    active={location.hash === "#/clips" || location.hash === "#/videos" || location.hash === "#/"}
                    icon={SiApplearcade}
                    onClick={() => location.hash = "/"}
                    tooltip='Clips'
                    chakraColor='brand.secondary'
                />
                <NavBarButton
                    active={location.hash === "#/discover"}
                    icon={AiOutlineCompass}
                    onClick={() => location.hash = "/discover"}
                    tooltip='Discover'
                    chakraColor='brand.primary'
                />
                <Flex
                    mt="auto"
                    mb="auto"
                >
                    <NavBarButton
                        active={recording}
                        icon={AiFillCamera}
                        onClick={() => location.hash = "/record"}
                        tooltip="Recording..."
                        color="red"
                        animation={recording ? "recordingAnimate 3.5s linear infinite;" : undefined}
                        bg={recording ? "" : undefined}
                    />

                </Flex>
            </Flex>

            <Flex
                alignItems='center'
                flexDir='column'
                flex='0'
            >
                <NavBarButton
                    icon={FaCog}
                    active={location.hash === "#/settings"}
                    tooltip='Settings'
                    onClick={() => location.hash = "/settings"}
                    chakraColor='gray.400'
                />
                <NavBarButton
                    active={false}
                    icon={GoSignOut}
                    tooltip='Sign Out'
                    chakraColor='red.500'
                    onClick={() => auth.signOut()}
                />
            </Flex>
        </Menu >
    </Flex >
}