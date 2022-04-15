import { Flex, Heading, useToast } from '@chakra-ui/react';
import * as React from "react";
import { useEffect, useState } from "react";
import { useLock } from 'src/components/hooks/useLock';
import { DashboardMain } from 'src/components/obs/dashboardMain';
import { LockDisplay } from 'src/components/obs/LockDisplayer';
import { RenderLogger } from 'src/interfaces/renderLogger';


const log = RenderLogger.get("App")
const App = () => {
    const { obs } = window.api

    const toast = useToast()
    const { progress, isLocked } = useLock()
    const [tryAgain, setTryAgain] = useState(() => Math.random())
    const [obsInitialized, setOBSInitialized] = useState(() => obs.isInitialized())

    useEffect(() => {
        const curr = obs.isInitialized()
        if(curr !== obsInitialized)
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

                setTimeout(() => setTryAgain(Math.random()), 1000)
            })
    }, [obsInitialized, tryAgain, isLocked]);

    return <Flex
        width='100%'
        height='100%'
        alignItems='center'
        justifyContent='center'
        direction='column'
    >
        {!isLocked && obsInitialized ? <DashboardMain /> : <LockDisplay progress={progress ?? { percent: 0, status: "Initializing..."}} />}
    </Flex>
}
export default App;
