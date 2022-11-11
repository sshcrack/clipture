import { SessionData } from '@backend/managers/auth/interfaces';
import { Flex } from '@chakra-ui/react';
import React from "react";
import DiscoverList from 'src/components/discover/DiscoverList';
import NavBar from 'src/components/general/NavBar';

export default function DiscoverPage({ data }: { data: SessionData }) {
    return <Flex h='100%' w='100%'>
        <NavBar
            data={data}
            w='5em'
            h='100%'
        />
        <Flex
            w='100%'
            h='100%'
            justifyContent='center'
            alignItems='center'
        >
            <DiscoverList />
        </Flex>
    </Flex>
}