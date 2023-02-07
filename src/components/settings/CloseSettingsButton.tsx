import React, { useEffect, useContext } from "react"
import { IconButton } from '@chakra-ui/react'
import { AiOutlineClose } from 'react-icons/ai'
import { SettingsSaveContext } from 'src/pages/main/subpages/settings/SettingsSaveProvider'

export type Props = { prevPage: string }
export default function CloseSettingsButton({ prevPage }: Props) {
    const { modified, onShake } = useContext(SettingsSaveContext)
    const onClose = () => {
        if(!modified)
            return location.hash = prevPage

        onShake()
    }

    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if (e.key !== "Escape")
                return

            onClose()
        }

        window.addEventListener("keydown", listener)
        return () => window.removeEventListener("keydown", listener)
    }, [prevPage])

    return <IconButton
        rounded='full'
        flex='0'
        aria-label='Close'
        colorScheme='gray'
        variant='outline'
        icon={<AiOutlineClose />}
        onClick={() => onClose()}
    />
}