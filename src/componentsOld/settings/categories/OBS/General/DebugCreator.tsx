import { Button, Flex, Text, useToast } from '@chakra-ui/react'
import React, { useState } from "react"
import { useTranslation } from 'react-i18next'

export default function DebugCreator() {
    const { t } = useTranslation("settings", { keyPrefix: "obs.general.debug" })

    const { system } = window.api
    const [loading, setLoading] = useState(false)
    const toast = useToast()

    return <Flex
        alignItems='center'
        w='70%'
    >
        <Text flex='1'>{t("title")}</Text>
        <Button
            colorScheme='green'
            isLoading={loading}
            onClick={() => {
                setLoading(true)
                system.saveDebugFile()
                    .then(() => toast({
                        title: t("success_title")
                    }))
                    .catch(e => {
                        toast({
                            title: t("error_title"),
                            status: "error",
                            description: JSON.stringify(e?.stack ?? e?.message ?? e)
                        })
                    })
                    .finally(() => {
                        toast({
                        })
                        setLoading(false)
                    })
            }}>Save</Button>
    </Flex>

}