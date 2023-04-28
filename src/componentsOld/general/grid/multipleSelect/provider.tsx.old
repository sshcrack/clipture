import React, { PropsWithChildren, useState } from "react"

export type MultipleSelectState = {
    selected: string[],
    addSelect: (vid: string) => void,
    removeSelect: (vid: string) => void
}
export const MultipleSelectContext = React.createContext<MultipleSelectState>({
    selected: [],
    addSelect: () => {/**/},
    removeSelect: () => {/**/}
})

export default function MultipleSelectProvider({ children }: PropsWithChildren) {
    const [selected, setSelected] = useState([])

    return <MultipleSelectContext.Provider
        value={{
            selected,
            addSelect: v => setSelected([v, ...selected]),
            removeSelect: v => {
                const index = selected.indexOf(v)
                if (index === -1)
                    return

                const clone = [...selected]
                clone.splice(index, 1)

                setSelected(clone)
            }
        }}
    >{children}</MultipleSelectContext.Provider>
}
