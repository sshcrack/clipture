import { SessionData, SessionStatus } from '@backend/managers/auth/interfaces';
import { useToast } from '@chakra-ui/react';
import { SetStateAction, useEffect, useState } from 'react';
import { RenderLogger } from 'src/interfaces/renderLogger';

const log = RenderLogger.get("Hooks", "useSession")
export function useSession() {
    const [data, setData] = useState<SessionData | undefined | null>(() => undefined)
    const [status, setStatus] = useState(() => SessionStatus.LOADING)
    const [ update, setUpdate ]= useState(() => Math.random())
    const toast = useToast()

    useEffect(() => {
        const { auth } = window.api
        auth.subscribeToUpdates(() => setUpdate(Math.random()))
    }, [])

    useEffect(() => {
        const { auth } = window.api

        console.log("Session get")
        auth.getSession()
            .then(({ status, data }) => {
                console.log(status, data)
                setStatus(status)
                setData(data)
            })
            .catch(e => {
                log.error(e)
                toast({
                    title: "Error",
                    description: "Could not obtain session"
                })
            })
    }, [ update ])

    return { status, data }
}
