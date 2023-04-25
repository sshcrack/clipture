import { Flex } from '@chakra-ui/react'
import React, { useEffect, useState } from "react"

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
        let setTo = null as string[]

        const handler = (e: KeyboardEvent) => {
            if (!document.activeElement.classList.contains("select-everything"))
                return


            const selectAll = e.key === "a" && e.ctrlKey
            if (!selectAll)
                return


            e.preventDefault()
            const same = JSON.stringify(available) === JSON.stringify(selection)
            if (same) {
                setTo = []
                return
            }

            setTo = available.concat([])
        }

        const keyUp = () => {
            if (setTo)
                setSelection(setTo)
        }

        window.addEventListener("keydown", handler)
        window.addEventListener("keyup", keyUp)
        return () => {
            window.removeEventListener("keydown", handler)
            window.removeEventListener("keyup", keyUp)
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