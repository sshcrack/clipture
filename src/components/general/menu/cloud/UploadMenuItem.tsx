import { useToast } from '@chakra-ui/react'
import { AiOutlineCloudUpload } from 'react-icons/ai'
import { ReactSetState } from 'src/types/reactUtils'
import { ContextMenuItem } from '../base/ContextMenuItem'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

type Props = {
    disabled: boolean,
    clipName: string,
    setUpdate: ReactSetState<number>
}

export default function UploadMenuItem({ clipName, disabled, setUpdate }: Props) {
    const toast = useToast()
    const { t } = useTranslation("general", { keyPrefix: "menu.context_menu" })

    const { cloud } = window.api
    const [isUploading, setUploading] = useState(false)

    return <ContextMenuItem
        isDisabled={disabled}
        colorScheme='green'
        leftIcon={< AiOutlineCloudUpload />}
        isLoading={isUploading}
        onClick={() => {
            cloud.upload(clipName.replace(".clipped.mp4", ""))
                .catch(e => toast({
                    status: "error",
                    title: "Could not upload clip",
                    description: e?.stack ?? e,
                    duration: 4000
                }))
                .finally(() => {
                    setUploading(false)
                    setUpdate(Math.random())
                    cloud.share(clipName.replace(".clipped.mp4", ""))
                        .then(() => toast({
                            status: "info",
                            description: t("to_clipboard")
                        }))
                })
        }}
    > {t("upload")}</ContextMenuItem>
}