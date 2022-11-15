import { SessionInfo } from '@backend/managers/auth/interfaces'
import { DiscoverClip } from '@backend/managers/cloud/interface'
import { Button, Flex, useToast } from '@chakra-ui/react'
import React, { useEffect, useState } from "react"
import { useTranslation } from 'react-i18next'
import { GoChevronLeft } from 'react-icons/go'
import { useParams } from 'react-router-dom'
import NavBar from 'src/components/general/NavBar'
import GeneralSpinner from 'src/components/general/spinner/GeneralSpinner'
import TitleBarItem from 'src/components/titlebar/TitleBarItem'
import TitlebarSize from 'src/components/titlebar/TitlebarSize'
import VideoSingleItem from '../single/Video'

export default function DiscoverListSingle({ info }: { info: SessionInfo }) {
    const { id } = useParams()
    const { t } = useTranslation("discover", { "keyPrefix": "button" })
    const [item, setItem] = useState<DiscoverClip>(null)
    const { data } = info
    const toast = useToast()

    useEffect(() => {
        window.api.cloud.getId(id)
            .then(e => setItem(e))
            .catch(() => toast({
                status: "error",
                description: `Could not get clip with id ${id}`
            }))
    }, [])

    return <TitlebarSize size='50px'>
        <Flex
            h='100%'
            w='100%'
            gap='4'
        >
            <NavBar
                data={data}
                w='5em'
                h='100%'
            />
            <Flex
                w='100%'
                h='100%'
                justifyContent='center'
                alignItems='start'
                flexDir='column'
                pt='3'
                pb='5'
                gap='4'
            >
                {!item ? <GeneralSpinner loadingText='Loading item...' /> : <VideoSingleItem item={item} />}
            </Flex>
            <TitleBarItem>
                <Button
                    leftIcon={<GoChevronLeft />}
                    onClick={() => location.hash = "#/discover"}
                    variant='outline'
                    colorScheme='red'
                    ml='2'
                >
                    {t("exit")}
                </Button>
                <Flex w='100%' />
            </TitleBarItem>
        </Flex>
    </TitlebarSize>
}