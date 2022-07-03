import { SessionData } from '@backend/managers/auth/interfaces'
import { Flex, IconButton } from '@chakra-ui/react'
import React, { useEffect, useState } from "react"
import { AiOutlineClose } from 'react-icons/ai'
import { useParams } from 'react-router-dom'
import SettingsMenu from 'src/components/settings/navbar/SettingsMenu'
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
type SubCategories<T extends Categories> = keyof typeof mappings[T]

export default function SettingsPage({ prevPage }: { data: SessionData, prevPage: string }) {
    const { item } = useParams()
    const [recording, setRecording] = useState(false)
    const { obs } = window.api


    const defaultPage = OBSGeneral
    const itemParts = item?.split("-")
    const category: Categories = itemParts?.shift() as any
    const leftOver = itemParts?.join("-")

    //@ts-ignore typescript is being weird with dictionary indexes
    const CurrPage: () => JSX.Element = mappings?.[category]?.[leftOver] ?? defaultPage
    console.log(CurrPage, category, leftOver)

    useEffect(() => {
        setRecording(obs.isRecording())
        return obs.onRecordChange(newRec => setRecording(newRec))
    }, [])
    return <SettingsSaveProvider>
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
                        <CurrPage />
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
                            onClick={() => location.hash = prevPage}
                        />
                    </Flex>

                </Flex>
            </Flex>
        </Flex>
    </SettingsSaveProvider>
}