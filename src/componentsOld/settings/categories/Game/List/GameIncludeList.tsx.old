import { GeneralGame } from '@backend/managers/game/interface'
import { WindowInformation } from '@backend/managers/obs/Scene/interfaces'
import { Box, Flex, Heading, Text, useToast } from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from "react"
import { useTranslation } from 'react-i18next'
import GeneralSpinner from 'src/componentsOld/general/spinner/GeneralSpinner'
import { SettingsSaveContext } from 'src/pages/main/subpages/settings/SettingsSaveProvider'
import CustomSelect from './CustomSelect'

type SelectItem = { value: GeneralGame, label: string }

export default function GameIncludeList() {
    const { addModified, removeModified, addSaveListener, saving } = useContext(SettingsSaveContext)
    const { game } = window.api
    const { t } = useTranslation("settings", { keyPrefix: "game.list.include" })

    const toast = useToast()

    const [update, setUpdate] = useState(0)

    const [list, setList] = useState(undefined as GeneralGame[])
    const [originalList, setOriginalList] = useState(undefined as GeneralGame[])
    const [available, setAvailable] = useState(undefined as WindowInformation[])

    useEffect(() => game.addUpdateListener((p, d) => {
        setUpdate(Math.random())
        console.log("Update listener was fired with", p, d)
    }), [])

    useEffect(() => {
        if (saving)
            return


        const handleCatch = (title: string) => {
            return (e: any) => {
                toast({
                    title: title,
                    description: e.message ?? e.stack ?? e
                })

                setTimeout(() => {
                    setUpdate(Math.random())
                }, 1000)
            }
        }

        const listCatch = handleCatch(t("error.list"))
        const availableCatch = handleCatch(t("error.available"))
        game.listInclude()
            .then(e => {
                setList([...e])
                setOriginalList([...e])
            })
            .catch(e => listCatch(e))

        game.availableWindows(true)
            .then(e => setAvailable(e))
            .catch(e => availableCatch(e))
    }, [saving, update])

    useEffect(() => {
        if (JSON.stringify(list) !== JSON.stringify(originalList))
            addModified("game_include_list")
        else
            removeModified("game_include_list")
    }, [list, originalList])

    useEffect(() => addSaveListener(() => game.setInclude(list)), [list])
    if (!list || !originalList || !available)
        return <Flex w='100%' h='100%' justifyContent='center' alignItems='center'>
            <GeneralSpinner loadingText={t("loading")} />
        </Flex>

    const listOptions = available
        .filter(e => !list.some(x => x.type === "window" && JSON.stringify(x.game) === JSON.stringify(e)))
        .map(e => {
            return {
                value: {
                    type: "window",
                    game: e
                },
                label: `[${e.executable}]: ${e.title}`
            }
        }) as SelectItem[]

    const filtered = list
        .map(e => {
            if (e.type === "window")
                return {
                    label: `[${e.game.executable}]: ${e.game.title}`,
                    value: e
                }

            return {
                label: e.game.name,
                value: e
            }
        }) as SelectItem[]

    return <Flex
        w='70%'
        h='100%'
        flexDir='column'
        gap='5'
        alignItems='center'
    >
        <Heading size='md'>{t("title")}</Heading>
        <CustomSelect
            defaultValue={filtered}
            isMulti
            isSearchable
            name="available"
            onChange={e => setList(e.map(e => e.value))}
            options={listOptions}
            className="basic-multi-select"
            placeholder={t("placeholder")}
            classNamePrefix="select"
        />
        <Text>{t("require_restart")}</Text>
        <Box h='10rem' />
    </Flex>
}