import { DiscoverClip } from '@backend/managers/cloud/interface'
import { ReactSetState } from 'src/types/reactUtils'
import React, { useState } from "react"

export type DiscoverState = {
    setSearch: ReactSetState<string>,
    search: string,
    items: DiscoverClip[],
    setItems: ReactSetState<DiscoverClip[]>,
    fetching: boolean,
    setFetching: ReactSetState<boolean>
}

export const DiscoverContext = React.createContext<DiscoverState>({
    items: null,
    search: null,
    setItems: () => { /**/ },
    setSearch: () => { /**/ },
    fetching: false,
    setFetching: () => {/**/ }
})

export default function DiscoverProvider({ children }: React.PropsWithChildren<{ /**/ }>) {
    const [search, setSearch] = useState<string>(null)
    const [fetching, setFetching] = useState<boolean>(null)
    const [items, setItems] = useState<DiscoverClip[]>(null)

    return <DiscoverContext.Provider
        value={{
            items,
            setItems,
            search,
            setSearch,
            fetching,
            setFetching
        }}
    >
        {children}
    </DiscoverContext.Provider>
}