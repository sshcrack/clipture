import { Box, Button, Flex, Grid, GridItem, Heading, Image } from '@chakra-ui/react';
import React, { useState } from 'react';
import { FaDiscord } from "react-icons/fa";

export default function LoginPage() {
    const { auth } = window.api
    const [authenticating, setAuthenticating] = useState(false)

    const SignInBtn = ({ disabled }: { disabled: boolean }) => <Button
        isLoading={disabled}
        leftIcon={<FaDiscord />}
        aria-label='Sign In Discord'
        loadingText='Opening browser...'
        bg='rgba(88, 101, 242, 1)'
    >Sign in using Discord</Button>

    return <Flex
        alignItems='center'
        justifyContent='start'
        flexDir='column'
        w='100%'
        h='100%'
        m='3'
    >
        <Image
            src="../assets/logo_text.svg"
            h='12'
        />

        <Flex
            flexDir='column'
            w='100%'
            h='100%'
            justifyContent='center'
            alignItems='center'
        >
            <Heading
                mb='10'
            >Sign In</Heading>
            <Grid>
                <GridItem gridRow='1' gridColumn='1' zIndex='100'>
                    <Box onClick={() => {
                        console.log("Box click")
                        setAuthenticating(true)
                        auth.signIn()
                            .finally(() => setAuthenticating(false))
                    }} style={{ opacity: 0 }}>
                        <SignInBtn disabled={false} />
                    </Box>
                </GridItem>
                <GridItem gridRow='1' gridColumn='1'>
                    <SignInBtn disabled={authenticating} />
                </GridItem>
            </Grid>
        </Flex>
    </Flex >
}