import { Box, Button, Flex, Grid, GridItem, Heading, Image, useToast } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaDiscord } from "react-icons/fa";
import { RenderLogger } from 'src/interfaces/renderLogger';

const log = RenderLogger.get("OBS", "LoginPage")
export default function LoginPage() {
    const { auth } = window.api
    const { t } = useTranslation("login")
    const [authenticating, setAuthenticating] = useState(false)
    const toast = useToast()

    const SignInBtn = ({ disabled }: { disabled: boolean }) => <Button
        isLoading={disabled}
        leftIcon={<FaDiscord />}
        aria-label='Sign In Discord'
        loadingText={t("opening_browser")}
        bg='rgba(88, 101, 242, 1)'
    >{t("sign_in")}</Button>

    return <Flex
        alignItems='center'
        justifyContent='start'
        flexDir='column'
        w='100%'
        h='100%'
    >
        <Image
            src="../assets/logo_text.svg"
            h='4em'
            pt='3'
        />

        <Flex w='100%' h='100%' justifyContent='center' alignItems='center'>
            <Image
                src={"../assets/illustrations/sign_in.gif"}
                w='30em'
                h='30em'
                filter="drop-shadow(2px 4px 20px white)"
            />
            <Flex
                flexDir='column'
                w='100%'
                h='100%'
                justifyContent='center'
                alignItems='center'
                flex='.5'
            >
                <Heading mb='10'>Sign In</Heading>
                <Grid>
                    <GridItem gridRow='1' gridColumn='1' zIndex='100'>
                        <Box onClick={() => {
                            setAuthenticating(true)
                            auth.signIn()
                                .catch(e => {
                                    log.error("Could not authenticate", e)
                                    toast({
                                        title: "Error",
                                        status: "error",
                                        description: "Could not authenticate you. For more details view logs.",
                                    })
                                })
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
        </Flex>
    </Flex >
}