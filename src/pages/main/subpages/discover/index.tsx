import { SessionData } from '@backend/managers/auth/interfaces'
import { Flex, Heading, Image } from '@chakra-ui/react'
import React from "react"
import { NavBar } from 'src/components/general/NavBar'

export default function DiscoverPage({ data }: { data: SessionData }) {
    return <Flex h='100%' w='100%'>
        <NavBar
            data={data}
            w='5em'
            h='100%'
        />
        <Flex
            alignSelf='center'
            justifySelf='center'
            marginLeft='auto'
            marginRight='auto'
            h='70%'
            w='70%'
            justifyContent='center'
            alignItems='center'
            flexDir='column'
            background='url(../assets/wip.gif)'
            backgroundPosition='center'
            backgroundSize='contain'
            backgroundRepeat='no-repeat'
        >
            <Flex
                justifyContent='center'
                alignItems='center'
                w='75%'
                h='75%'
                backdropFilter='blur(10px)'
            >
                <Heading textAlign='center'>Our monkeys are working hard on this feature...</Heading>
            </Flex>
        </Flex>
    </Flex>
}