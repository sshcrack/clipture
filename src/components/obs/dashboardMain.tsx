import { Box, Flex } from '@chakra-ui/react';
import React from 'react';
import { useSession } from '../hooks/useSession';

export function DashboardMain() {
    const { auth } = window.api
    const { data, status } = useSession()

    return <Flex
        justifyContent='space-around'
        alignItems='center'
        flexDirection='column'
    >
        <a href="#" onClick={() => auth.open()}>Login</a>
        {JSON.stringify(data)}
        {JSON.stringify(status)}
    </Flex>
}