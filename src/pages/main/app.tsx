import { SessionStatus } from '@backend/managers/auth/interfaces'
import { useToast } from '@chakra-ui/react'
import React, { useEffect, useState } from "react"
import { HashRouter, Route, Routes } from "react-router-dom"
import { useLock } from 'src/components/hooks/useLock'
import { useSession } from 'src/components/hooks/useSession'
import { RenderLogger } from 'src/interfaces/renderLogger'
import DashboardPage from './subpages/DashboardPage'
import EditorPage from './subpages/EditorPage'
import { InitializePage } from './subpages/InitializePage'
import LoginPage from './subpages/LoginPage'

const log = RenderLogger.get("App")
export default function App() {
    const { obs } = window.api

    const toast = useToast()
    const { data, status } = useSession()

    const { progress, isLocked } = useLock()
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

    const initialized = !isLocked && obsInitialized && status !== SessionStatus.LOADING
    if (!initialized)
        return <InitializePage progress={progress ?? { percent: 0, status: "Initializing..." }} />

    if (status === SessionStatus.UNAUTHENTICATED)
        return <LoginPage />

    return <HashRouter>
        <Routes>
            <Route path="/" element={<DashboardPage data={data} />} />
            <Route path="/editor/:videoName" element={<EditorPage />}></Route>
        </Routes>
    </HashRouter>
}