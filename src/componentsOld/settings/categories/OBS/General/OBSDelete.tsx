import { DeleteMethods } from '@backend/managers/storage/interface'
import { Flex, Text } from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from "react"
import { useTranslation } from 'react-i18next'
import GeneralSpinner from 'src/componentsOld/general/spinner/GeneralSpinner'
import { SettingsSaveContext } from 'src/pages/main/subpages/settings/SettingsSaveProvider'
import CustomSelect from '../../Game/List/CustomSelect'

export default function OBSDelete() {
    const { addModified, removeModified, saving, addSaveListener } = useContext(SettingsSaveContext)
    const [original, setOriginal] = useState([] as DeleteMethods[])
    const [curr, setCurr] = useState([] as DeleteMethods[])
    const { t } = useTranslation("settings", { keyPrefix: "game.behavior.delete" })
    const { storage } = window.api

    const availableMethods = Object.values(DeleteMethods).filter(e => isNaN(e as number))
    const stringifiedMethods = availableMethods.map((e, i) => ({
        value: i,
        readable: t(`delete_methods.${e}` as any) ?? e
    }))

    useEffect(() => {
        storage.getDeleteMode()
            .then(e => {
                setOriginal(e)
                setCurr(e)
            })
    }, [saving])

    useEffect(() => {
        return addSaveListener(() => storage.setDeleteMode(curr))
    }, [curr])

    const listOptions = stringifiedMethods.map(e => ({
        label: e.readable,
        value: e.value
    }))

    const value = curr?.map((e, i) => {
        const { readable, value } = stringifiedMethods[e]
        const afterReadable = curr.length > 1 && i < curr.length -1 ? `${readable} ${t("and")}` : readable

        return {
            label: afterReadable,
            value: value
        }
    }) ?? []

    return <Flex w='70%' flexDir='column'>
        <Text flex='1' mb='8px'>{t("title")}</Text>
        {curr ? <CustomSelect
            placeholder={t("delete_methods.NONE")}
            value={value}
            options={listOptions}
            isMulti
            isSearchable
            name='delete_select'
            classNamePrefix="select"
            className="basic-multi-select"
            onChange={(e => {
                const newArr = Array.from(e.values())
                    .map(e => e.value)
                if (JSON.stringify(newArr) === JSON.stringify(original))
                    removeModified("delete_methods")
                else
                    addModified("delete_methods")

                setCurr(newArr)
            })}
        /> : <GeneralSpinner loadingText={t("loading")} />}
    </Flex>

}