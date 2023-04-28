import { Button, Tooltip } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import React, { useState } from "react"

export default function RefreshGamesBtn({ automaticRecord }: { automaticRecord: boolean }) {
    const { t } = useTranslation("record")
    const { obs } = window.api
    const [refreshing, setRefreshing] = useState(false)

    const btn = <Button
        colorScheme='blue'
        loadingText='Rechecking games...'
        isLoading={refreshing}
        disabled={!automaticRecord}
        onClick={() => {
            setRefreshing(true)
            obs.refreshGames()
                .finally(() => setRefreshing(false))
        }}
    >{t("refresh")}</Button>


    console.log("Refresh record", automaticRecord, t("enable_tooltip"))
    if (automaticRecord)
        return btn

    return <Tooltip label={t("enable_tooltip") as string} shouldWrapChildren>
        {btn}
    </Tooltip>
}