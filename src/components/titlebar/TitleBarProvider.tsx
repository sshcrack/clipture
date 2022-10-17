import React, { useState } from "react"
import { ReactSetState } from 'src/types/reactUtils'
import CloseBehaviorListener from './CloseBehaviorListener'

export type MenuMap = Map<number, React.ReactNode>
export type TitlebarState = {
    menu: MenuMap,
    size: string,
    setSize: ReactSetState<string>,
    setUpdate: ReactSetState<number>
}

export const TitlebarContext = React.createContext<TitlebarState>({
    menu: new Map(),
    size: "28px",
    setSize: () => { },
    setUpdate: () => { }
})

export default function TitleBarProvider(p: React.PropsWithChildren) {
    const [menu, _] = useState<MenuMap>(() => new Map())
    const [_1, setUpdate] = useState(() => Math.random())
    const [size, setSize] = useState("28px")
    return <CloseBehaviorListener>
        <TitlebarContext.Provider
            value={{
                menu,
                size,
                setSize,
                setUpdate
            }}
        >
            {p.children}
        </TitlebarContext.Provider>
    </CloseBehaviorListener>
}