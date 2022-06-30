import { Flex, Heading } from '@chakra-ui/react'
import React from "react"
export default function EmptyPlaceholder({ img}: { img?: string }) {
    return <Flex
        justifyContent='center'
        alignItems='center'
        w='100%'
        h='100%'
        flexDir='column'
    >
        <Flex flex='1'
            backgroundImage={img ?? '../assets/illustrations/empty.gif'}
            filter='drop-shadow(2px 4px 7rem var(--chakra-colors-illustration-secondary))'
            zIndex='-1000'
            backgroundRepeat='no-repeat'
            backgroundPosition='center'
            backgroundSize='contain'
            w='100%'
            h='100%'
        />
        <Heading fontSize='2.25vw'>Pretty empty isn't it? Gonna ahead, play some games!</Heading>
        <Heading fontSize='1.75vw'>They'll automatically be recorded</Heading>
    </Flex>
}