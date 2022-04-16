import { SessionData } from '@backend/managers/auth/interfaces';
import { Button, Flex, Heading, Menu, Text } from '@chakra-ui/react';
import React from "react";
import { AiOutlineCompass } from "react-icons/ai";
import { SiApplearcade } from "react-icons/si"
import { GoSignOut } from "react-icons/go";
import { FaCog } from "react-icons/fa"
import NavBarButton from './NavBarButton';

export function NavBar({ data }: { data: SessionData }) {
    const { image, name } = data.user
    const { auth } = window.api

    return <Flex flexDir='column' w='100%' h='100%' bg='gray.700' p='3'>
        <Menu>
            <Flex
                flex='.5'
                w='100%'
                h='100%'
                flexDir='column'
                gap='5'
                mb='100'
            >
                <NavBarButton
                    active={true}
                    icon={SiApplearcade}
                    text='Clips'
                    color='red.400'
                />
                <NavBarButton
                    active={false}
                    icon={AiOutlineCompass}
                    text='Discover'
                    color='yellow.400'
                />
            </Flex>

            <Flex
                alignItems='center'
                flexDir='column'
                flex='.5'
                gap='5'
            >
                <NavBarButton
                    icon={FaCog}
                    active={false}
                    text='Settings'
                    color='cyan.400'
                />
                <NavBarButton
                    active={false}
                    icon={GoSignOut}
                    text='Sign Out'
                    color='yellow.400'
                />
            </Flex>
        </Menu>
    </Flex>
}