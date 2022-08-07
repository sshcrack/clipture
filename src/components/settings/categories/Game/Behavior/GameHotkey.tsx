import { Flex, Input, Text, useToast } from "@chakra-ui/react"
import React, { useContext, useEffect, useRef, useState } from "react"
import { RenderLogger } from "src/interfaces/renderLogger"
import { SettingsSaveContext } from "src/pages/main/subpages/settings/SettingsSaveProvider"

const log = RenderLogger.get("Components", "Settings", "Categories", "Game", "Behavior", "GameHotkey")
export default function GameHotkey() {
    const [originalHotkey, setOriginalHotkey] = useState(null as string)
    const [hotkey, setHotkey] = useState(null as string)

    const [update, setUpdate] = useState(0)
    const [listening, setListening] = useState(false)

    const toast = useToast()

    const { saving, addModified, removeModified, addSaveListener } = useContext(SettingsSaveContext)
    const { bookmark } = window.api

    useEffect(() => {
        bookmark.getHotkey()
            .then(e => {
                setHotkey(e)
                setOriginalHotkey(e)
            })
            .catch(e => {
                log.error("Could not get hotkey", e)
                toast({
                    title: "Could not get hotkey",
                    description: "Trying again in 5 seconds..",
                    status: "error"
                })

                setTimeout(() => {
                    setUpdate(Math.random())
                }, 5000)
            })
    }, [saving, update])

    useEffect(() => {
        bookmark.listenKey()
            .then(e => {
                setHotkey(e)
                if (originalHotkey !== e)
                    addModified("game_hotkey")
                else
                    removeModified("game_hotkey")
            })
    }, [listening])

    useEffect(() => {
        return addSaveListener(() =>
            bookmark.setHotkey(hotkey)
        )
    }, [])

    return <Flex>
        <Input
            value={listening ? "Press key to bind" : hotkey}
            borderColor={listening ? "red" : "inherit"}
            onClick={() => {
                setListening(!listening)
            }}
        />
    </Flex>
}