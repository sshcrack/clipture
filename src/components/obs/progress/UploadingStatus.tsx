import { Progress } from '@backend/processors/events/interface'
import { Flex } from '@chakra-ui/react'
import React from "react"
import { useTranslation } from 'react-i18next'
import AnimatedProgress from './AnimatedProgress'

export default function UploadingStatus({ status }: { status: Progress }) {
    const { t } = useTranslation("dashboard", { keyPrefix: "clips" })

    const primaryColor = "var(--chakra-colors-white)"
    const secondaryColor = "var(--chakra-colors-green-500)"

    return <Flex
        w='100%'
        h='100%'
        justifyContent='center'
        alignItems='center'
        flex='1'
    >

        <AnimatedProgress
            status={t("uploading")}
            percent={status.percent}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            animate={false}
        />
    </Flex>
}