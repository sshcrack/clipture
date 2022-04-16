import { SessionData } from '@backend/managers/auth/interfaces';
import { Flex, Menu } from '@chakra-ui/react';
import React from "react";
import { AiOutlineCompass } from "react-icons/ai";
import { FaCog } from "react-icons/fa";
import { GoSignOut } from "react-icons/go";
import { SiApplearcade } from "react-icons/si";
import "src/components/obs/NavBar/styles.css";
import NavBarButton from './NavBarButton';

export function NavBar({ data }: { data: SessionData }) {
    const { image, name } = data.user
    const { auth } = window.api

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
                flex='1'
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
        </Menu>
    </Flex>
}