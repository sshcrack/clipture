import { SessionData } from '@backend/managers/auth/interfaces'
import { Flex, Heading, IconButton, Kbd, Text } from '@chakra-ui/react'
import React, { useEffect, useState } from "react"
import { useTranslation } from 'react-i18next'
import { AiOutlineClose } from 'react-icons/ai'
import { useParams } from 'react-router-dom'
import SettingsMenu from 'src/components/settings/navbar/SettingsMenu'
import SettingsSavePopup from 'src/components/settings/popup/SavePopup'
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


export default function SettingsPage({ prevPage }: { data: SessionData, prevPage: string }) {
    const { item } = useParams()
    const [recording, setRecording] = useState(true)
    const [ update, setUpdate ] = useState(0)

    const { t } = useTranslation("settings")
    const { obs } = window.api


    const defaultPage = OBSGeneral
    const itemParts = item?.split("-")
    const category: Categories = itemParts?.shift() as any
    const leftOver = itemParts?.join("-")

    //@ts-ignore typescript is being weird with dictionary indexes
    const CurrPage: () => JSX.Element = mappings?.[category]?.[leftOver] ?? defaultPage

    const onClose = () => location.hash = prevPage

    useEffect(() => {
        setRecording(obs.isRecording())
        return obs.onRecordChange(newRec => setRecording(newRec))
    }, [])

    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if (e.key !== "Escape")
                return

            onClose()
        }

        window.addEventListener("keydown", listener)
        return () => window.removeEventListener("keydown", listener)
    }, [prevPage])

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
                        <IconButton
                            rounded='full'
                            flex='0'
                            aria-label='Close'
                            colorScheme='gray'
                            variant='outline'
                            icon={<AiOutlineClose />}
                            onClick={() => onClose()}
                        />
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    </SettingsSaveProvider>
}