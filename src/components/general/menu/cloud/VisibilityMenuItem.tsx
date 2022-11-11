import { ClipCloudInfo } from '@backend/managers/clip/interface'
import { useToast } from '@chakra-ui/react'
import React from "react"
import { useTranslation } from 'react-i18next'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'
import { ReactSetState } from 'src/types/reactUtils'
import { ContextMenuItem } from '../base/ContextMenuItem'

export type VisibilityMenuItemProps = {
    cloud: ClipCloudInfo,
    setUpdate: ReactSetState<number>,
}

export default function VisibilityMenuItem({ cloud: cloudInfo, setUpdate }: VisibilityMenuItemProps) {
    const toast = useToast()
    const { t } = useTranslation("general", { keyPrefix: "menu.context_menu.visibility" })

    const { cloud } = window.api
    const isPublic = cloudInfo?.isPublic

    return <ContextMenuItem
        colorScheme='cyan'
        leftIcon={isPublic ? <AiFillEyeInvisible /> : <AiFillEye />}
        onClick={() => {
            const newVisibility = !isPublic
            cloud.discover.visibility(cloudInfo.id, newVisibility)
                .then(() => {
                    toast({
                        status: "success",
                        description: newVisibility ? t("desc_public") : t("desc_private")
                    })
                    setUpdate(Math.random())
                })
                .catch(e => {
                    console.error(e)
                    toast({
                        status: "error",
                        description: `Could not set visibility: ${e?.message ?? e?.stack ?? e}`
                    })
                })
        }}
    > {isPublic ? t("make_private") : t("make_public")}</ContextMenuItem>
}