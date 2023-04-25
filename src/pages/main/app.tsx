import { SessionStatus } from '@backend/managers/auth/interfaces'
import { useToast } from '@chakra-ui/react'
import React, { useEffect, useState } from "react"
import { useTranslation } from 'react-i18next'
import { HashRouter, Route, Routes } from "react-router-dom"
import DiscoverListSingle from 'src/componentsOld/discover/list/DiscoverListSingle'
import { useLock } from 'src/componentsOld/hooks/useLock'
import { useSession } from 'src/componentsOld/hooks/useSession'
import { RenderLogger } from 'src/interfaces/renderLogger'
import DashboardPage from './subpages/dashboard'
import DiscoverPage from './subpages/discover'
import EditorPage from './subpages/editor/EditorPage'
import { InitializePage } from './subpages/initialize'
import LoginPage from './subpages/login'
import RecordPage from './subpages/record'
import SettingsPage from './subpages/settings'

const log = RenderLogger.get("App")
export default function App() {
    const { obs, prerequisites } = window.api
    const { t } = useTranslation("app")

    const toast = useToast()

    const info = useSession()
    const { status } = info

    const { progress, isLocked } = useLock()
    const [prevPage, setPrevPage] = useState("/")

    const [tryAgainInit, setTryAgainInit] = useState(() => Math.random())
    const [tryAgainValid, setTryAgainValid] = useState(() => Math.random())
    const [tryAgainObs, setTryAgainObs] = useState(() => Math.random())

    const [obsInitialized, setOBSInitialized] = useState(() => obs.isInitialized())
    const [downloadedModules, setModulesDownloaded] = useState(undefined as boolean)
    const [originalDownloadedModules, setOriginalModulesDownload] = useState(undefined as boolean)
/*
    useEffect(() => {
        console.log("Checking if prerequisites are valid")
        prerequisites.isValid()
            .then(e => {
                console.log("Valid", e)
                setOriginalModulesDownload(e.valid)
                setModulesDownloaded(e.valid)
            })
            .catch(e => {
                log.error(e)
                toast({
                    title: t("valid_error"),
                    description: t("retrying", { error: e.message ?? e.stack ?? e })
                })
                setTimeout(() => setTryAgainValid(Math.random()), 5000)
            })
    }, [tryAgainValid])

    useEffect(() => {
        if (downloadedModules !== false)
            return

        console.log("Initializing prerequisites")
        prerequisites.initialize()
            .then(() => setModulesDownloaded(true))
            .catch(e => {
                const msg = e?.message

                const silent = typeof msg === "string" && msg.startsWith("[I] ")
                !silent && log.error(e)
                !silent && toast({
                    title: t("pre_init_error"),
                    description: t("retrying", { error: e?.stack ?? e?.message ?? e })
                })

                setTimeout(() => {
                    setTryAgainInit(Math.random())
                }, 5000)
            })
    }, [downloadedModules, tryAgainInit])

    useEffect(() => {
        if (obsInitialized || !downloadedModules)
            return

        console.log("Initializing obs...")
        obs.initialize()
            .then(() => setOBSInitialized(true))
            .catch(e => {
                log.error(e)
                toast({
                    title: t("obs_initialize_error"),
                    description: t("retrying", { error: e?.stack ?? e?.message ?? e })
                })
                setTimeout(() => setTryAgainObs(Math.random()), 5000)
            })
    }, [downloadedModules, obsInitialized, tryAgainObs])

    useEffect(() => {
        const listener = ({ oldURL }: HashChangeEvent) => {
            if (oldURL.includes("settings"))
                return

            const url = new URL(oldURL)
            setPrevPage(url.hash)
        }

        window.addEventListener("hashchange", listener)
        return () => window.removeEventListener("hashchange", listener)
    }, [])
*/
    const initialized = false && !isLocked && obsInitialized && downloadedModules && status !== SessionStatus.LOADING

    const { status: progStat, percent } = progress ?? { percent: 0, status: t("initializing") }
    const relativePercentage = downloadedModules ? percent * 0.5 + 0.5 : percent * 0.5
    if (!initialized)
        return <InitializePage progress={{ status: progStat, percent: originalDownloadedModules ? percent : relativePercentage }} />

    if (status === SessionStatus.UNAUTHENTICATED)
        return <LoginPage />

    return <HashRouter>
        <Routes>
            <Route path="/" element={<DashboardPage info={info} />} />
            <Route path="/:mode" element={<DashboardPage info={info} />} />
            <Route path="/discover" element={<DiscoverPage info={info} />} />
            <Route path="/discover/single" element={<DiscoverPage info={info} type='single' />} />
            <Route path="/discover/list" element={<DiscoverPage info={info} type='list' />} />
            <Route path="/videoSingle/:id" element={<DiscoverListSingle info={info} />} />
            <Route path="/record" element={<RecordPage info={info} />} />
            <Route path="/settings" element={<SettingsPage prevPage={prevPage} />} />
            <Route path="/settings/:item" element={<SettingsPage prevPage={prevPage} />} />
            <Route path="/editor/:videoName" element={<EditorPage />} />
        </Routes>
    </HashRouter>
}