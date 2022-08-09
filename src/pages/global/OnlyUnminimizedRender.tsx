import React, { PropsWithChildren, useEffect, useState } from "react"

export default function OnlyUnmimimizedRender({ children }: PropsWithChildren) {
    const [ hidden, setHidden] = useState(false)
    const { system } = window.api

    useEffect(() => {
        return system.addTrayEventListener(e => {
            setHidden(e)
        })
    }, [])

    if(hidden)
        return <></>

    return <>{children}</>
}