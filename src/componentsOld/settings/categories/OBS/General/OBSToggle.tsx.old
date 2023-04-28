import { Switch } from '@chakra-ui/react'
import React, { useContext } from "react"
import { SettingsSaveContext } from 'src/pages/main/subpages/settings/SettingsSaveProvider'

export default function OBSToggle() {
    const { addModified, removeModified} = useContext(SettingsSaveContext)
    return <Switch onChange={newVal => newVal.target.checked ? addModified("toggle") : removeModified("toggle")}/>
}