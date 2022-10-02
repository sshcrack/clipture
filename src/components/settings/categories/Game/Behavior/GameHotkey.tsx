import { Flex, Input, Text, useToast } from "@chakra-ui/react"
import React, { useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import GeneralSpinner from 'src/components/general/spinner/GeneralSpinner'
import { RenderLogger } from "src/interfaces/renderLogger"
import { SettingsSaveContext } from "src/pages/main/subpages/settings/SettingsSaveProvider"

const log = RenderLogger.get("Components", "Settings", "Categories", "Game", "Behavior", "GameHotkey")
export default function GameHotkey() {
    const [originalHotkey, setOriginalHotkey] = useState(null as string)
    const [hotkey, setHotkey] = useState(null as string)

    const [update, setUpdate] = useState(0)
    const [trigger, setTrigger] = useState(0)
    const [listening, setListening] = useState(false)

    const toast = useToast()

    const { saving, addModified, removeModified, addSaveListener } = useContext(SettingsSaveContext)
    const { bookmark } = window.api
    const { t } = useTranslation("settings", { keyPrefix: "game.behavior.hotkey" })


    useEffect(() => {
        bookmark.getHotkey()
            .then(e => {
                setHotkey(e ?? "F9")
                setOriginalHotkey(e ?? "F9")
            })
            .catch(e => {
                log.error("Could not get hotkey", e)
                toast({
                    title: t("error.title"),
                    description: t("error.description"),
                    status: "error"
                })

                setTimeout(() => {
                    setUpdate(Math.random())
                }, 5000)
            })
    }, [saving, update])

    useEffect(() => {
        if (!listening)
            return

        bookmark.listenKey()
            .then(e => {
                setHotkey(e)
                setTrigger(Math.random())
                if (originalHotkey !== e)
                    addModified("game_hotkey")
                else
                    removeModified("game_hotkey")
            }).catch(() => setListening(false))
    }, [listening, trigger])

    useEffect(() => {
        return addSaveListener(() =>
            bookmark.setHotkey(hotkey)
        )
    }, [hotkey])

    return <Flex
        w='80%'
        justifyContent='center'
        alignItems='center'
    >
        <Text w='100%'>{t("label")}</Text>
        {!hotkey ?
            <GeneralSpinner loadingText={t("loading")} /> :
            <Input
                w='100%'
                value={!listening ? hotkey : t("rebind", { hotkey })}
                borderColor={listening ? "green" : "inherit"}
                onClick={() => {
                    setListening(true)
                }}
                onBlur={() => setListening(false)}
            />
        }
    </Flex>
}