import { ClipCloudInfo } from '@backend/managers/clip/interface'
import { useToast } from '@chakra-ui/react'
import React from "react"
import { useTranslation } from 'react-i18next'
import { AiOutlineLink } from 'react-icons/ai'
import { ContextMenuItem } from '../base/ContextMenuItem'

export default function ShareMenuItem({ clipName, cloud: cloudInfo }: { clipName: string, cloud: ClipCloudInfo }) {
    const toast = useToast()
    const { t } = useTranslation("general", { keyPrefix: "menu.context_menu" })

    const { cloud } = window.api
    const cloudOnly = cloudInfo?.cloudOnly

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