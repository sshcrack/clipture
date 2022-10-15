import React, { useState } from "react"
import { useEffect } from 'react'
import { ReactSetState } from 'src/types/reactUtils'

export type SelectionProviderState = {
    selection: string[]
    setSelection: ReactSetState<string[]>
}

export const SelectionContext = React.createContext<SelectionProviderState>({
    selection: null,
    setSelection: null
})

type Props = {
    available: string[]
}

export function SelectionProvider({ children, available }: React.PropsWithChildren<Props>) {
    const [selection, setSelection] = useState([] as string[])

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const selectAll = e.key === "a" && e.ctrlKey
            if (!selectAll)
                return

            e.preventDefault()
            const same = JSON.stringify(available) === JSON.stringify(selection)
            if (same)
                return setSelection([])

            setSelection(available.concat([]))
        }

        window.addEventListener("keydown", handler)
        return () => {
            window.removeEventListener("keydown", handler)

        }
    }, [available, selection])

    return <SelectionContext.Provider value={{ selection, setSelection }}>
        {children}
    </SelectionContext.Provider>
}