import { SessionData } from '@backend/managers/auth/interfaces';
import { Button, Flex } from '@chakra-ui/react';
import React from 'react';
import { NavBar } from './NavBar';

export function DashboardMain({ data }: { data: SessionData }) {
    const { auth } = window.api

    return <Flex
        alignItems='center'
        flexDirection='column'
        width='100%'
        height='100%'
        p='2'
    >
        <NavBar data={data} />
        <Flex flex='1'>
            <Button onClick={() => auth.signOut()}>Sign out</Button>
        </Flex>
    </Flex>
}