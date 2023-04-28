import React, { PropsWithChildren } from "react"

export type IndividualTabState = {
    index: number,
    tabSize: string,
    isActive: boolean
}

export const IndividualTabContext = React.createContext<IndividualTabState>({ index: 0, tabSize: "", isActive: false })

export default function TabIndexProvider({ children, index, tabSize, isActive }: PropsWithChildren<IndividualTabState>) {
    return <IndividualTabContext.Provider
        value={{ index, tabSize: tabSize ?? '5', isActive }}
    >
        {children}
    </IndividualTabContext.Provider>
}