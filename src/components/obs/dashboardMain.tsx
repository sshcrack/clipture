import { SessionData } from '@backend/managers/auth/interfaces';
import { Flex, Heading } from '@chakra-ui/react';
import React from 'react';
import Videos from './videos';
import { NavBar } from './NavBar/';

export function DashboardMain({ data }: { data: SessionData }) {
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
            <Heading>Videos</Heading>
            <Videos />
        </Flex>
    </Flex>
}