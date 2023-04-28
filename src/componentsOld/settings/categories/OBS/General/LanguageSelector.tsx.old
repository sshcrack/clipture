import { Flex, Select, Text } from "@chakra-ui/react"
import React, { useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import options from "src/locales/list.json"
import { SettingsSaveContext } from 'src/pages/main/subpages/settings/SettingsSaveProvider'

export default function LanguageSelector() {
    const { addModified, removeModified, saving, addSaveListener } = useContext(SettingsSaveContext)
    const { t, i18n } = useTranslation("settings", { keyPrefix: "obs.language" })
    const { system } = window.api

    const [original, setOriginal] = useState(undefined)
    const [current, setCurrent] = useState(undefined)

    useEffect(() => {
        const lang = i18n.resolvedLanguage
        setOriginal(lang)
        setCurrent(lang)
    }, [saving])

    useEffect(() => {
        return addSaveListener(async () => {
            i18n.changeLanguage(current)
            await system.setLanguage(current)
        })
    }, [current])

    return <Flex
        w='70%'
        alignItems='center'
        flexDir='column'
    >
        <Text>{t("language")}</Text>
        <Select
            value={current}
            onChange={e => {
                const val = e.target.value
                if (val !== original)
                    addModified("language")
                else
                    removeModified("language")

                setCurrent(val)
            }}
        >
            {Object.entries(options)
                .map(([key, name]) => (
                    <option value={key} key={`${key}-${name}`}>{name}</option>
                ))
            }
        </Select>
    </Flex>
}