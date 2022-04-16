import { Box, Button, Flex } from '@chakra-ui/react';
import React, { useState } from 'react';
import { FaDiscord } from "react-icons/fa";

export default function LoginPage() {
    const { auth } = window.api
    const [authenticating, setAuthenticating] = useState(false)

    return <Flex
        alignItems='center'
        justifyContent='center'
    >
        <Box onClick={() => {
            setAuthenticating(true)
            auth.signIn()
                .finally(() => setAuthenticating(false))
        }} >
            <Button
                isLoading={authenticating}
                leftIcon={<FaDiscord />}
                aria-label='Sign In Discord'
                loadingText='Opening browser...'
                bg='rgba(88, 101, 242, 1)'
            >Sign in using Discord</Button>
        </Box>
    </Flex>
}