import { Flex } from '@chakra-ui/react'
import React, { MutableRefObject, useState } from "react"
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
            if (!document.activeElement.classList.contains("select-everything"))
                return

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
            window.addEventListener("keydown", handler)
        }
    }, [available, selection])

    return <SelectionContext.Provider value={{ selection, setSelection }}>
        <Flex
            w='100%'
            h='100%'
            justifyContent='center'
            flexDir='column'
            alignItems='center'
        >
            {children}
        </Flex>
    </SelectionContext.Provider>
}