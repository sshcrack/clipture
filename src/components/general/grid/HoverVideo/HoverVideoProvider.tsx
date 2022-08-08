import React, { useState } from 'react'
import { ReactSetState } from 'src/types/reactUtils'

type HoverVideoState = {
    hovered: boolean,
    setHovered: ReactSetState<boolean>
}
export const HoverVideoContext = React.createContext<HoverVideoState>({
    hovered: false,
    setHovered: () => { }
})

export default function HoverVideoProvider(props: React.PropsWithChildren) {
    const [hovered, setHovered] = useState(false)

    return <HoverVideoContext.Provider value={{
        hovered,
        setHovered
    }}>
        {props.children}
    </HoverVideoContext.Provider>
}