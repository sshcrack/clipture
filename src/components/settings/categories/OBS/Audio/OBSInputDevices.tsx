import { List, ListItem } from '@chakra-ui/react';
import * as React from "react"
import { useContext, useEffect, useState } from 'react';
import GeneralSpinner from 'src/components/general/spinner/GeneralSpinner';
import { SettingsSaveContext } from 'src/pages/main/subpages/settings/SettingsSaveProvider';

export default function OBSInputDevices() {
    const { addSaveListener, addModified, removeModified, saving } = useContext(SettingsSaveContext)
    const [sources, setSources] = useState(undefined as string[])
    const [originalSources, setOriginalSources] = useState(undefined as string[])

    const { audio } = window.api
    useEffect(() => {
        audio.activeSources()
            .then(e => {
                setSources(e)
                setOriginalSources(e)
            })
    }, [saving])

    if (!sources || !originalSources)
        return <GeneralSpinner loadingText='Getting sources...' />

    const items = sources.map(e => {
        return <ListItem key={`sources-item-${e}`}>
            {e}
        </ListItem>
    })

    return <List>
        {items}
    </List>
}