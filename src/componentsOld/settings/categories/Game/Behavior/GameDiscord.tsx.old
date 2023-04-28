import { Flex, Switch, Text } from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from "react"
import { useTranslation } from 'react-i18next'
import { SettingsSaveContext } from 'src/pages/main/subpages/settings/SettingsSaveProvider'

export default function BehaviorDiscord() {
    const { addModified, removeModified, saving, addSaveListener } = useContext(SettingsSaveContext)
    const [original, setOriginal] = useState(undefined as boolean)
    const [curr, setCurr] = useState(undefined as boolean)
    const { t } = useTranslation("settings", { keyPrefix: "game.behavior.discord" })
    const { discord } = window.api

    useEffect(() => {
        discord.get()
            .then(e => {
                console.log("Got dc", e)
                setOriginal(e)
                setCurr(e)
            })
    }, [saving])

    useEffect(() => {
        return addSaveListener(() => {
            console.log("saving", curr)
            return discord.set(curr)
        })
    }, [curr])

    console.log("Curr", curr, "original", original)
    return <Flex
        justifyContent='space-around'
        alignItems='center'
        w='70%'
    >
        <Text flex='1' mb='8px'>{t("title")}</Text>
        <Switch isChecked={curr} onChange={e => {
            const { checked } = e.target
            setCurr(checked)

            if (checked === original)
                removeModified("discord")
            else
                addModified("discord")
        }} />
    </Flex>

}