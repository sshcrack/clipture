import { Flex, Select, Text } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import options from "src/locales/list.json"

export default function LanguageSelector() {
    const { t, i18n } = useTranslation("settings", { keyPrefix: "obs.language" })
    const currLang = i18n.language

    return <Flex
        w='70%'
        justifyContent='space-around'
        alignItems='center'
        flexDir='column'
    >
        <Text>{t("language")}</Text>
        <Select
            defaultValue={currLang}
            onChange={e => {
                i18n.changeLanguage(e.target.value)
            }}
        >
            {Object.entries(options)
                .map(([key, name]) => (
                    <option value={key}>{name}</option>
                ))
            }
        </Select>
    </Flex>
}