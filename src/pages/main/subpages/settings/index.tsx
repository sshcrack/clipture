import { SessionData } from '@backend/managers/auth/interfaces'
import { Flex, Heading } from '@chakra-ui/react'
import React from "react"
import { NavBar } from 'src/components/general/NavBar'

export default function SettingsPage({ data }: { data: SessionData }) {
    return <Flex h='100%' w='100%'>
        <NavBar
            data={data}
            w='5em'
            h='100%'
        />
        <Heading>Work in Progress...</Heading>
    </Flex>
}