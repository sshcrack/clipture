import { SessionData, SessionStatus } from '@backend/managers/auth/interfaces';
import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
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

        auth.getSession()
            .then(({ status, data }) => {
                setStatus(status)
                setData(data)
            })
            .catch(e => {
                log.error(e)
                toast({
                    title: "Error",
                    description: `Could not obtain session ${e}. Retrying...`
                })

                setTimeout(() => setUpdate(Math.random()), 1000)
            })
    }, [ update ])

    return { status, data }
}
