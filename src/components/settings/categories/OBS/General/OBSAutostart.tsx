import { Flex, Heading, Switch, Text, useToast } from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from "react"
import GeneralSpinner from 'src/components/general/spinner/GeneralSpinner'
import { SettingsSaveContext } from 'src/pages/main/subpages/settings/SettingsSaveProvider'

export default function OBSAutostart() {
    const { addModified, removeModified, saving, addSaveListener } = useContext(SettingsSaveContext)
    const [original, setOriginal] = useState(undefined)
    const [current, setCurrent] = useState(undefined)

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
                    title: "Error",
                    description: "Could not obtain autostart status. Retrying..."
                })

                setTimeout(() => setUpdate(Math.random()), 5000)
            })
    }, [saving, update])

    useEffect(() => {
        return addSaveListener(() => system.setAutolaunch(current))
    }, [current])

    if (original === undefined || current === undefined)
        return <GeneralSpinner loadingText='Loading autostart...' />

    return <Flex
        justifyContent='space-around'
        alignItems='center'
        w='70%'
    >
        <Text>Autostart</Text>
        <Switch onChange={newVal => {
            const e = newVal.target.checked
            setCurrent(e)
            if (e !== original)
                addModified("obs_autostart")
            else
                removeModified("obs_autostart")
        }} />
    </Flex>

}