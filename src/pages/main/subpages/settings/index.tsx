import { Flex, Heading } from '@chakra-ui/react'
import React, { useEffect, useState } from "react"
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import CloseSettingsButton from 'src/componentsOld/settings/CloseSettingsButton'
import SettingsMenu from 'src/componentsOld/settings/navbar/SettingsMenu'
import SettingsSavePopup from 'src/componentsOld/settings/popup/SavePopup'
import GameBehavior from './categories/Game/Behavior'
import GameList from './categories/Game/List'
import OBSAudio from './categories/OBS/Audio'
import OBSGeneral from './categories/OBS/General'
import OBSVideo from './categories/OBS/Video'
import SettingsSaveProvider from './SettingsSaveProvider'

const mappings = {
    "game": {
        "behavior": GameBehavior,
        "list": GameList
    },
    "obs": {
        "audio": OBSAudio,
        "general": OBSGeneral,
        "video": OBSVideo
    }
}

type Categories = keyof typeof mappings
const onlyAvailableWhenNotRecording = [
    {
        category: "obs",
        name: "general"
    },
    {
        category: "obs",
        name: "video"
    }
] as {
    category: Categories,
    name: string
}[]


export default function SettingsPage({ prevPage }: { prevPage: string }) {
    const { item } = useParams()
    const [recording, setRecording] = useState(true)
    const [ update, setUpdate ] = useState(0)

    const { t } = useTranslation("settings")
    const { obs } = window.api


    const defaultPage = OBSGeneral
    const itemParts = item?.split("-")
    const category = itemParts?.shift() as unknown as Categories
    const leftOver = itemParts?.join("-")

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore typescript is being weird with dictionary indexes
    const CurrPage: () => JSX.Element = mappings?.[category]?.[leftOver] ?? defaultPage

    useEffect(() => {
        setRecording(obs.isRecording())
        return obs.onRecordChange(newRec => setRecording(newRec))
    }, [])

    const pageAvailable = !onlyAvailableWhenNotRecording.some(e => e.category === category && e.name === leftOver)
    const displayPage = !recording || pageAvailable
    return <SettingsSaveProvider>
        {displayPage && <SettingsSavePopup onReset={() => setUpdate(Math.random())}/>}
        <Flex
            h='100%'
            w='100%'
            justifyContent='center'
            alignItems='center'
            flexDir='column'
        >
            <Flex
                flex='1'
                h='100%'
                w='100%'
            >
                <SettingsMenu padding='4' />
                <Flex
                    flex='1 1 800px'
                    h='100%'
                    w='100%'
                    padding='4'
                >
                    <Flex
                        w='100%'
                        h='100%'
                        flex='1'
                        flexDirection='column'
                        alignItems='center'
                        justifyContent='center'
                    >
                        {displayPage && <CurrPage key={update}/>}
                        {!displayPage && <Flex
                            flexDir='column'
                            justifyContent='center'
                            alignItems='center'
                        >
                            <Heading size='xl'>{t("recording_must_be_stopped.title")}</Heading>
                            <Heading size='md'>{t("recording_must_be_stopped.subtitle")}</Heading>
                        </Flex>}
                    </Flex>
                    <Flex
                        flex='0'
                    >
                        <CloseSettingsButton prevPage={prevPage}/>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    </SettingsSaveProvider>
}