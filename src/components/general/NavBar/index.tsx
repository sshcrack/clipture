import { SessionData } from '@backend/managers/auth/interfaces';
import { Flex, FlexProps, Menu } from '@chakra-ui/react';
import React, { LegacyRef, useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { AiFillCamera, AiOutlineCompass } from "react-icons/ai";
import { FaCog } from "react-icons/fa";
import { GoSignOut } from "react-icons/go";
import { SiApplearcade } from "react-icons/si";
import "src/components/general/Navbar/index.css";
import NavBarButton from './NavBarButton';

export function NavBar({ data, ...props }: { data: SessionData, ref?: LegacyRef<HTMLDivElement> } & FlexProps) {
    const { auth, obs } = window.api
    const { t } = useTranslation("navbar")

    const [recording, setRecording] = useState(() => window.api.obs.isRecording())

    useEffect(() => {
        return obs.onRecordChange(r => {
            setRecording(r)
        })
    }, [])

    const defaultItem = location.hash === "#/clips"
        || location.hash === "#/videos"
        || location.hash === "#/"
        || location.hash === '#'
        || location.hash === ""
    return <Flex
        flexDir='column'
        bg="brand.bg"
        w='100%'
        ref={props?.ref}
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
                    active={defaultItem}
                    icon={SiApplearcade}
                    onClick={() => location.hash = "/"}
                    tooltip={t("clips")}
                    chakraColor='brand.secondary'
                />
                <NavBarButton
                    active={location.hash === "#/discover"}
                    icon={AiOutlineCompass}
                    onClick={() => location.hash = "/discover"}
                    tooltip={t("discover")}
                    chakraColor='brand.primary'
                />
                <Flex
                    mt="auto"
                    mb="auto"
                    w='100%'
                >
                    <NavBarButton
                        active={recording}
                        icon={AiFillCamera}
                        onClick={() => location.hash = "/record"}
                        tooltip={t("recording")}
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
                    tooltip={t("settings")}
                    onClick={() => location.hash = "/settings"}
                    chakraColor='gray.400'
                />
                <NavBarButton
                    active={false}
                    icon={GoSignOut}
                    tooltip={t("sign_out")}
                    chakraColor='red.500'
                    onClick={() => auth.signOut()}
                />
            </Flex>
        </Menu >
    </Flex >
}