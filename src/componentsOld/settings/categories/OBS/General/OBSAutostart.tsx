import { Flex, Switch, Text, useToast } from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from "react"
import { useTranslation } from 'react-i18next'
import GeneralSpinner from 'src/componentsOld/general/spinner/GeneralSpinner'
import { SettingsSaveContext } from 'src/pages/main/subpages/settings/SettingsSaveProvider'

export default function OBSAutostart() {
    const { addModified, removeModified, saving, addSaveListener } = useContext(SettingsSaveContext)
    const { t } = useTranslation("settings", { keyPrefix: "obs.general.autostart" })

    const [original, setOriginal] = useState<boolean>(undefined)
    const [current, setCurrent] = useState<boolean>(undefined)

    const { system } = window.api
    const toast = useToast()

    const [update, setUpdate] = useState(0)
    useEffect(() => {
        system.isAutolaunch()
            .then(e => {
                setCurrent(e)
                setOriginal(e)
            })
            .catch(() => {
                toast({
                    title: t("error.title"),
                    description: t("error.description")
                })

                setTimeout(() => setUpdate(Math.random()), 5000)
            })
    }, [saving, update])

    useEffect(() => {
        return addSaveListener(() => system.setAutolaunch(current))
    }, [current])

    if (original === undefined || current === undefined)
        return <GeneralSpinner loadingText={t("loading")} />

    return <Flex
        alignItems='center'
        w='70%'
    >
        <Text flex='1'>{t("title")}</Text>
        <Switch isChecked={current} onChange={newVal => {
            const e = newVal.target.checked
            setCurrent(e)
            if (e !== original)
                addModified("obs_autostart")
            else
                removeModified("obs_autostart")
        }} />
    </Flex>

}