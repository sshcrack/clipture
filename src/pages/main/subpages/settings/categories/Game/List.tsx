import { SessionStatus } from '@backend/managers/auth/interfaces'
import { Flex, Heading } from '@chakra-ui/react'
import React, { useState, useEffect } from "react"
import { useTranslation } from 'react-i18next'
import OfflinePlaceholder from 'src/componentsOld/general/placeholder/OfflinePlaceholder'
import GeneralSpinner from 'src/componentsOld/general/spinner/GeneralSpinner'
import { useSession } from 'src/componentsOld/hooks/useSession'
import GameExcludeList from 'src/componentsOld/settings/categories/Game/List/GameExcludeList'
import GameIncludeList from 'src/componentsOld/settings/categories/Game/List/GameIncludeList'

export default function GameList() {
    const { t } = useTranslation("settings", { keyPrefix: "game.list" })
    const [hasCache, setCache] = useState(false)
    const { status } = useSession()
    const { game } = window.api

    useEffect(() => {
        if (status === SessionStatus.OFFLINE) {
            game.hasCache()
                .then(e => setCache(e))
            return
        }

        if (status === SessionStatus.LOADING) {
            setCache(null)
            return
        }

        setCache(true)
    }, [status])

    return hasCache === false ? <OfflinePlaceholder /> :
        <>
            <Heading>{t("title")}</Heading>
            <Flex
                w='100%'
                h='100%'
                flexDir='column'
                alignItems='center'
            >
                {hasCache === null ? <GeneralSpinner loadingText='Loading...'/> :
                    <>
                        <GameExcludeList />
                        <GameIncludeList />
                    </>}
            </Flex>
        </>
}