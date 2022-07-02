import { SessionStatus } from '@backend/managers/auth/interfaces'
import { Box, useToast } from '@chakra-ui/react'
import React, { useEffect, useState } from "react"
import { HashRouter, Route, Routes } from "react-router-dom"
import { useLock } from 'src/components/hooks/useLock'
import { useSession } from 'src/components/hooks/useSession'
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
    const { obs } = window.api

    const toast = useToast()
    const { data, status } = useSession()

    const { progress, isLocked } = useLock()
    const [ prevPage, setPrevPage ] = useState("/")
    const [tryAgain, setTryAgain] = useState(() => Math.random())
    const [obsInitialized, setOBSInitialized] = useState(() => obs.isInitialized())

    useEffect(() => {
        const curr = obs.isInitialized()
        if (curr !== obsInitialized)
            setOBSInitialized(curr)

        console.log("Checking if locked")
        if (obsInitialized || isLocked)
            return

        log.info("Initializing OBS...")
        obs.initialize()
            .then(() => setOBSInitialized(true))
            .catch((err: Error) => {

                log.error("Failed to initialize OBS", err)
                toast({
                    title: "OBS could not be initialized",
                    description: err?.stack ?? err?.message ?? JSON.stringify(err),
                    duration: 15000
                })

                setTimeout(() => setTryAgain(Math.random()), 10000)
            })
    }, [obsInitialized, tryAgain, isLocked]);

    useEffect(() => {
        const listener = ({ oldURL }: HashChangeEvent) => {
            if(oldURL.includes("settings"))
                return

            const url = new URL(oldURL)
            setPrevPage(url.hash)
        }

        window.addEventListener("hashchange", listener)
        return () => window.removeEventListener("hashchange" ,listener)
    }, [])

    const initialized = !isLocked && obsInitialized && status !== SessionStatus.LOADING
    if (!initialized)
        return <InitializePage progress={progress ?? { percent: 0, status: "Initializing..." }} />

    if (status === SessionStatus.UNAUTHENTICATED)
        return <LoginPage />

    return <HashRouter>
        <Routes>
            <Route path="/" element={<DashboardPage data={data} />} />
            <Route path="/:mode" element={<DashboardPage data={data} />} />
            <Route path="/discover" element={<DiscoverPage data={data} />} />
            <Route path="/record" element={<RecordPage data={data} />} />
            <Route path="/settings" element={<SettingsPage data={data} prevPage={prevPage} />} />
            <Route path="/settings/:item" element={<SettingsPage data={data} prevPage={prevPage} />}/>
            <Route path="/editor/:videoName" element={<EditorPage />}></Route>
        </Routes>
    </HashRouter>
}