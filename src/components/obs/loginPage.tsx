import { Button, Flex, IconButton } from '@chakra-ui/react';
import React from 'react';
import { FaDiscord } from "react-icons/fa"

export default function LoginPage() {
    const { auth } = window.api

    return <Flex
        alignItems='center'
        justifyContent='center'
    >
        <Button
        leftIcon={<FaDiscord />}
        aria-label='Sign In Discord'
        onClick={() => auth.signIn()}
        bg='rgba(88, 101, 242, 1)'
        >Sign in using Discord</Button>
    </Flex>
}