import { Flex, useToast } from '@chakra-ui/react';
import * as React from "react";
import { useEffect, useState } from "react";
import { RenderLogger } from 'src/interfaces/renderLogger';


const log = RenderLogger.get("App")
const App = () => {
    const { obs } = window.api

    const toast = useToast()
    const [tryAgain, setTryAgain] = useState(() => Math.random())
    const [obsInitialized, setOBSInitialized] = useState(false)//() => obs.isInitialized())

    useEffect(() => {
        if (obsInitialized)
            return

        obs.initialize()
            .then(() => setOBSInitialized(true))
            .catch((err: Error) => {

                //logger.error("Failed to initialize OBS", err)
                toast({
                    title: "OBS could not be initialized",
                    description: err?.stack ?? err?.message ?? JSON.stringify(err),
                    duration: 15000
                })

                setTimeout(() => setTryAgain(Math.random()), 1000)
            })
    }, [obsInitialized, tryAgain]);

    return <Flex>
        {obsInitialized ? "Initialized" : "false"}
    </Flex>
}
export default App;
