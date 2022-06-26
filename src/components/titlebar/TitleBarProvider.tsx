import React from "react"
import { useState } from 'react'
import { ReactSetState } from 'src/types/reactUtils'

export type TitlebarState = {
    menu: React.ReactNode[],
    setMenu: ReactSetState<React.ReactNode[]>,
    size: string,
    setSize: ReactSetState<string>
}

export const TitlebarContext = React.createContext<TitlebarState>({
    menu: [],
    setMenu: () => { },
    size: "28px",
    setSize: () => {}
})

export default function TitleBarProvider(p: React.PropsWithChildren) {
    const [menu, setMenu] = useState<React.ReactNode[]>([])
    const [size, setSize ] = useState("28px")
    return <TitlebarContext.Provider
        value={{
            menu,
            setMenu,
            size,
            setSize
        }}
    >
        {p.children}
    </TitlebarContext.Provider>
}