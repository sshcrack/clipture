import React, { useState } from "react"
import { ReactSetState } from 'src/types/reactUtils'
import CloseBehaviorListener from './CloseBehaviorListener'

export type MenuMap = Map<number, React.ReactNode>
export type TitlebarState = {
    menu: MenuMap,
    setMenu: ReactSetState<MenuMap>,
    size: string,
    setSize: ReactSetState<string>
}

export const TitlebarContext = React.createContext<TitlebarState>({
    menu: new Map(),
    setMenu: () => { },
    size: "28px",
    setSize: () => { }
})

export default function TitleBarProvider(p: React.PropsWithChildren) {
    const [menu, setMenu] = useState<MenuMap>(() => new Map())
    const [size, setSize] = useState("28px")
    return <CloseBehaviorListener>
        <TitlebarContext.Provider
            value={{
                menu,
                setMenu,
                size,
                setSize
            }}
        >
            {p.children}
        </TitlebarContext.Provider>
    </CloseBehaviorListener>
}