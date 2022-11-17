import { Tooltip, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AiOutlineCloudUpload } from 'react-icons/ai'
import { ReactSetState } from 'src/types/reactUtils'
import { ContextMenuItem } from '../base/ContextMenuItem'

type Props = {
    disabled: boolean,
    clipName: string,
    setUpdate: ReactSetState<number>,
    tooLarge: boolean
}

export default function UploadMenuItem({ clipName, disabled, setUpdate, tooLarge }: Props) {
    const toast = useToast()
    const { t } = useTranslation("general", { keyPrefix: "menu.context_menu" })

    const { cloud } = window.api
    const [isUploading, setUploading] = useState(false)

    const item = <ContextMenuItem
        isDisabled={disabled}
        colorScheme='green'
        leftIcon={< AiOutlineCloudUpload />}
        isLoading={isUploading}
        loadingText={t("uploading")}
        onClick={() => {
            if (tooLarge)
                return toast({
                    title: t("too_large"),
                    status: "warning",
                    duration: 1000 * 10
                })

            cloud.upload(clipName.replace(".clipped.mp4", ""), true)
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

    if (!tooLarge)
        return item

    return <Tooltip shouldWrapChildren label='Clip is too large.'>{item}</Tooltip>
}