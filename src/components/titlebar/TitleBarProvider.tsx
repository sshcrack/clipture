import React, { useState } from "react"
import { ReactSetState } from 'src/types/reactUtils'
import CloseBehaviorListener from './CloseBehaviorListener'

export type MenuMap = Map<number, React.ReactNode>
export type TitlebarState = {
    menu: MenuMap,
    size: string,
    sidebar: HTMLDivElement,
    setSidebar: ReactSetState<HTMLDivElement>,
    setSize: ReactSetState<string>,
    setUpdate: ReactSetState<number>
}

export const TitlebarContext = React.createContext<TitlebarState>({
    menu: new Map(),
    size: "34px",
    sidebar: null,
    setSidebar: () => {/**/},
    setSize: () => {/**/},
    setUpdate: () => {/**/}
})

export default function TitleBarProvider(p: React.PropsWithChildren) {
    const [menu] = useState<MenuMap>(() => new Map())
    const [,setUpdate] = useState(() => Math.random())
    const [sidebar, setSidebar] = useState(() => null)

    const [size, setSize] = useState("34px")
    return <CloseBehaviorListener>
        <TitlebarContext.Provider
            value={{
                sidebar,
                setSidebar,
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