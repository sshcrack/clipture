import { SessionData } from '@backend/managers/auth/interfaces';
import { Flex, Heading } from '@chakra-ui/react';
import React from 'react';
import Clips from './clips';
import { NavBar } from './NavBar/';

export function DashboardMain({ data }: { data: SessionData }) {
    const { auth } = window.api

    return <Flex
        gap={4}
        flexDir='row'

        width='100%'
        height='100%'
    >
        <Flex
            w='15em'
            h='100%'
        >
            <NavBar data={data} />
        </Flex>
        <Flex
            flexDir='column'
            alignItems='center'
            w='100%'
            h='100%'
        >
            <Heading>Clips</Heading>
            <Clips />
        </Flex>
    </Flex>
}