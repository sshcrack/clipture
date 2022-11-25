import { Button, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { RenderLogger } from 'src/interfaces/renderLogger';

const log = RenderLogger.get("Record", "SwitchMonitorBtn")
export default function SwitchMonitorBtn() {
    const { t } = useTranslation("record")
    const toast = useToast()
    const [monitors, setMonitors] = useState<number>(null)
    const [currMonitor, setCurrMonitor] = useState<number>(null)
    const [update, setUpdate] = useState(0)
    const [switching, setSwitching] = useState(false)
    const { obs } = window.api

    useEffect(() => {
        obs.availableMonitors().then(e => {
            setMonitors(e)
        })
    }, [])

    useEffect(() => {
        obs.getSceneInfo().then(e => {
            const { monitor } = e ?? {}
            if (monitor === undefined || monitor === null)
                return

            setCurrMonitor(monitor)
        }).catch(e => {
            log.error(e)
            toast({
                status: "error",
                description: "No scene info given."
            })
        })
    }, [update])

    return <Button
        colorScheme='blue'
        isLoading={switching}
        loadingText={t("switching_monitor")}
        onClick={() => {
            setSwitching(true)
            obs.switchDesktop((currMonitor + 1) % monitors)
                .catch(e => toast({
                    status: "error",
                    title: e?.title ?? "Could not switch desktop",
                    description: e?.stack ?? e
                }))
                .finally(() => {
                    setUpdate(Math.random())
                    setSwitching(false)
                })
        }}
    >{t("switch_monitor")}</Button>
}