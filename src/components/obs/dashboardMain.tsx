import { SessionData } from '@backend/managers/auth/interfaces';
import { Button, Flex, Grid, GridItem, Heading } from '@chakra-ui/react';
import React from 'react';
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
        <Flex flex='.5' flexDir='column'>
            <Heading>Clips</Heading>
            <p>Test Text</p>
        </Flex>
    </Flex>
}