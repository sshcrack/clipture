import { Box, Button, Flex, IconButton } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { FaDiscord } from "react-icons/fa"

export default function LoginPage() {
    const { auth } = window.api
    const [authenticating, setAuthenticating] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!ref.current)
            return

        const curr = ref.current
        if (curr.getAttribute("data-event-listener-added"))
            return

        curr.setAttribute("data-event-listener-added", "true")
        curr.addEventListener("click", () => {
            setAuthenticating(true)
            auth.signIn()
                .finally(() => setAuthenticating(false))
        })
    }, [ref])

    return <Flex
        alignItems='center'
        justifyContent='center'
    >
        <Box ref={ref} >
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