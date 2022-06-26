import React from "react"
import { useState } from 'react'
import { ReactSetState } from 'src/types/reactUtils'

export type TitlebarState = {
    menu: React.ReactNode[],
    setMenu: ReactSetState<React.ReactNode[]>
}

export const TitlebarContext = React.createContext<TitlebarState>({
    menu: [],
    setMenu: () => { }
})

export default function TitleBarProvider(p: React.PropsWithChildren) {
    const [menu, setMenu] = useState<React.ReactNode[]>([])
    return <TitlebarContext.Provider
        value={{
            menu,
            setMenu
        }}
    >
        {p.children}
    </TitlebarContext.Provider>
}