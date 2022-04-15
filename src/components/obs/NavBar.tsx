import { SessionData } from '@backend/managers/auth/interfaces';
import { Avatar, Flex, Menu, MenuButton, Text } from '@chakra-ui/react';
import React from "react"

export function NavBar({ data }: { data: SessionData }) {
    const { image, name } = data.user
    return <Flex
        flex='0'
        width='100%'
    >
        <Flex flex='1'>

        </Flex>
        <Flex
            justifyContent='center'
            alignItems='center'
        >
            <Avatar src={image} mr='2'/>
            <Text>{name}</Text>
        </Flex>
    </Flex>
}