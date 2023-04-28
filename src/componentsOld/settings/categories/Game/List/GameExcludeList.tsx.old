import { GeneralGame } from '@backend/managers/game/interface'
import { isDetectableGameInfo } from '@backend/managers/obs/core/tools'
import { DetectableGame } from '@backend/managers/obs/Scene/interfaces'
import { Box, Flex, Heading, useToast } from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from "react"
import { useTranslation } from 'react-i18next'
import GeneralSpinner from 'src/componentsOld/general/spinner/GeneralSpinner'
import { SettingsSaveContext } from 'src/pages/main/subpages/settings/SettingsSaveProvider'
import CustomSelect from './CustomSelect'

export default function GameExcludeList() {
    const { addModified, removeModified, addSaveListener, saving } = useContext(SettingsSaveContext)
    const { game } = window.api
    const { t } = useTranslation("settings", { keyPrefix: "game.list.exclude" })

    const toast = useToast()

    const [update, setUpdate] = useState(0)

    const [list, setList] = useState(undefined as GeneralGame[])
    const [originalList, setOriginalList] = useState(undefined as GeneralGame[])
    const [available, setAvailable] = useState(undefined as DetectableGame[])

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
        game.listExclude()
            .then(e => {
                setList([...e])
                setOriginalList([...e])
            })
            .catch(e => listCatch(e))

        game.detectable()
            .then(e => setAvailable(e))
            .catch(e => availableCatch(e))
    }, [saving, update])

    useEffect(() => {
        if (JSON.stringify(list) !== JSON.stringify(originalList))
            addModified("game_exclude_list")
        else
            removeModified("game_exclude_list")
    }, [list, originalList])

    useEffect(() => addSaveListener(() => game.setExclude(list)), [list])
    if (!list || !originalList || !available)
        return <Flex w='100%' h='100%' justifyContent='center' alignItems='center'>
            <GeneralSpinner loadingText={t("loading")} />
        </Flex>

    const listOptions = available
        .filter(e => !list.some(x => x.type === "detectable" && JSON.stringify(x.game) === JSON.stringify(e)))
        .map(e => {
            return {
                value: e,
                label: e.name
            }
        })

    const filtered = available.filter(e => list.some(x => {
        if (x.type === "detectable")
            return JSON.stringify(x.game) === JSON.stringify(e)
        else
            return isDetectableGameInfo(e, x.game)
    }))
        .map(e => ({
            label: e.name,
            value: e
        }))

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
            onChange={e => {
                setList(e.map(e => ({
                    game: e.value,
                    type: "detectable"
                })))
            }}
            options={listOptions}
            className="basic-multi-select"
            placeholder={t("placeholder")}
            classNamePrefix="select"
        />
        <Box h='10rem' />
    </Flex>
}