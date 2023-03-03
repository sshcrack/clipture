import { Flex, Select, Text } from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from "react"
import { useTranslation } from 'react-i18next'
import { SettingsSaveContext } from 'src/pages/main/subpages/settings/SettingsSaveProvider'
import OBSSimpleQualitySelector from './OBSSimpleQualitySelector'

type StateType = boolean
// eslint-disable-next-line @typescript-eslint/ban-types
export default function OBSAdvancedSelector({ children }: React.PropsWithChildren<{}>) {
    const [originalEnabled, setOriginalEnabled] = useState(undefined as StateType)
    const [enabled, setEnabled] = useState(undefined as StateType)

    const { addSaveListener, addModified, removeModified, saving } = useContext(SettingsSaveContext)
    const { obs } = window.api
    const { t } = useTranslation("settings", { keyPrefix: "obs.video.advanced_selector" })

    useEffect(() => {
        obs.getSettings()
            .then(({ advanced_enabled }) => {
                setOriginalEnabled(advanced_enabled)
                setEnabled(advanced_enabled)
            })
    }, [saving])

    useEffect(() => {
        return addSaveListener(async () => {
            await obs.updateSettings({ advanced_enabled: enabled })
        })
    }, [enabled, addSaveListener])

    return <>
        <Flex
            flexDir='column'
            w='70%'
        >
            <Text>{t("label")}</Text>
            <Select onChange={e => {
                const value = e.target.value === "1"
                console.log("original", originalEnabled, "value", value)
                if(originalEnabled !== value)
                    addModified("advanced_select")
                else
                    removeModified("advanced_select")

                setEnabled(value)
            }}>
                <option value={"0"}>{t("simple")}</option>
                <option value={"1"}>{t("advanced")}</option>
            </Select>
        </Flex>
        {enabled ? children : <OBSSimpleQualitySelector />}
    </>
}