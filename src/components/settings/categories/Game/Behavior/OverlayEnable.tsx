import { OverlayAlignment } from '@backend/managers/game/overlay/interface'
import { Flex, Select, Text } from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from "react"
import { useTranslation } from 'react-i18next'
import GeneralSpinner from 'src/components/general/spinner/GeneralSpinner'
import { SettingsSaveContext } from 'src/pages/main/subpages/settings/SettingsSaveProvider'


//! null = Overlay disabled
export default function OverlayEnable() {
    const { addModified, removeModified, saving, addSaveListener } = useContext(SettingsSaveContext)
    const [original, setOriginal] = useState(undefined as OverlayAlignment)
    const [curr, setCurr] = useState(undefined as OverlayAlignment)
    const { t } = useTranslation("settings", { keyPrefix: "game.behavior.overlay" })
    const { overlay } = window.api

    const availableMethods = Object.values({
        ...OverlayAlignment,
        "DISABLED": "DISABLED"
    }).filter(e => isNaN(e as number))

    const stringifiedMethods = availableMethods.map((e, i) => ({
        // -1 because of disabled
        value: i,
        readable: t(`alignment.${e}` as any) ?? e
    }))

    useEffect(() => {
        overlay.isEnabled()
            .then(enabled => {
                overlay.getAlignment()
                    .then(e => {
                        const method = enabled ? e : null
                        setOriginal(method)
                        setCurr(method)
                    })
            })
    }, [saving])

    useEffect(() => {
        return addSaveListener(async () => {
            if (curr === null) {
                console.log("Disabling overlay...")
                await overlay.setEnabled(false)
                return
            }

            console.log("Setting alignment to", curr)
            await overlay.setAlignment(curr)
            await overlay.setEnabled(true)
        })
    }, [curr])

    const { value } = stringifiedMethods[curr === null ? availableMethods.length - 1 : curr] ?? { value: "Error" }
    return <Flex w='70%' flexDir='column'>
        <Text flex='1' mb='8px'>{t("title")}</Text>
        {curr !== undefined ? <Select
            value={value}
            name='overlay_enable'
            onChange={(e => {
                const val = isNaN(e.target.value as unknown as number) ? null : parseInt(e.target.value)
                if (val === null || val === undefined)
                    return

                const valInt = val === availableMethods.length - 1 ? null : val
                if (valInt === original)
                    removeModified("overlay")
                else
                    addModified("overlay")

                setCurr(valInt)
            })}
        >
            {
                stringifiedMethods.map(({ readable, value }, i) => {
                    return <option key={`overlay-list-${i}`} value={value}>
                        {readable}
                    </option>
                })
            }
        </Select> : <GeneralSpinner loadingText='Loading...' />}
    </Flex>

}