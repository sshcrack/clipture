import React, { useState } from "react"
import { ReactSetState } from 'src/types/reactUtils'

export type SelectionProviderState = {
    selection: string[]
    setSelection: ReactSetState<string[]>
}

export const SelectionContext = React.createContext<SelectionProviderState>({
    selection: null,
    setSelection: null
})

export function SelectionProvider({ children }: React.PropsWithChildren) {
    const [selection, setSelection] = useState([] as string[])

    return <SelectionContext.Provider value={{ selection, setSelection }}>
        {children}
    </SelectionContext.Provider>
}