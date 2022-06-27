import { SessionData } from '@backend/managers/auth/interfaces';
import { Flex, FlexProps, Menu } from '@chakra-ui/react';
import React, { useEffect, useState } from "react";
import { AiOutlineCompass } from "react-icons/ai";
import { FaCog } from "react-icons/fa";
import { GoSignOut } from "react-icons/go";
import { SiApplearcade } from "react-icons/si";
import NavBarButton from './NavBarButton';

export function NavBar({ data, ...props }: { data: SessionData } & FlexProps) {
    const { auth, obs } = window.api
    const [recording, setRecording] = useState(() => window.api.obs.isRecording())
    const [recordDesc, setRecordDesc] = useState("Unknown")
    const computed = getComputedStyle(document.body)

    useEffect(() => {
        obs.onRecordChange(r => {
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
                    color='brand.secondary'
                />
                <NavBarButton
                    active={location.hash === "#/discover"}
                    icon={AiOutlineCompass}
                    onClick={() => location.hash = "/discover"}
                    tooltip='Discover'
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
                    active={location.hash === "#/settings"}
                    tooltip='Settings'
                    onClick={() => location.hash = "/settings"}
                    color='gray.400'
                />
                <NavBarButton
                    active={false}
                    icon={GoSignOut}
                    tooltip='Sign Out'
                    color='red.500'
                    onClick={() => auth.signOut()}
                />
            </Flex>
        </Menu >
    </Flex >
}