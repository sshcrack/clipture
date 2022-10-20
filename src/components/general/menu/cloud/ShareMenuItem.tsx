import { useToast } from '@chakra-ui/react'
import React from "react"
import { useTranslation } from 'react-i18next'
import { AiOutlineLink } from 'react-icons/ai'
import { ContextMenuItem } from '../base/ContextMenuItem'

export default function ShareMenuItem({ clipName, cloudOnly }: { clipName: string, cloudOnly: boolean }) {
    const toast = useToast()
    const { t } = useTranslation("general", { keyPrefix: "menu.context_menu" })

    const { cloud } = window.api

    return <ContextMenuItem
        colorScheme='green'
        leftIcon={<AiOutlineLink />}
        onClick={() => {
            const method = cloudOnly ? "shareId" : "share"
            cloud[method](clipName.replace(".clipped.mp4", ""))
                .then(() => toast({
                    description: t("to_clipboard")
                }))
        }}
    > {t("share")}</ContextMenuItem>
}