import React, { useState } from 'react';

type Listener = () => Promise<unknown>

export type SettingsSaveState = {
    addSaveListener: (callback: Listener) => () => void,
    save: () => Promise<unknown>,
    addModified: (str: string) => void,
    removeModified: (str: string) => void,
    modified: boolean
}
export const SettingsSaveContext = React.createContext<SettingsSaveState>({
    addSaveListener: () => (() => { }),
    save: () => Promise.resolve(),
    modified: false,
    addModified: () => {},
    removeModified: () => {}
})

export default function SettingsSaveProvider({ children }: React.PropsWithChildren) {
    const [listeners, setListeners] = useState([] as Listener[])
    const [modified, setModified] = useState([] as string[])

    const addModified = (s: string) => {
        const newModified = [s, ...modified.filter(e => e !== s)]
        setModified(newModified)
    }

    const removeModified = (s: string) => {
        const newModified = modified.filter(e => e !== s)
        setModified([ ...newModified])
    }

    return <SettingsSaveContext.Provider
        value={{
            addSaveListener: c => {
                listeners.push(c)
                setListeners([...listeners])
                return () => {
                    listeners.splice(listeners.indexOf(c), 1)
                }
            },
            modified: modified.length !== 0,
            addModified,
            removeModified,
            save: async () => {
                await Promise.all(listeners.map(e => e()))
            }
        }}
    >
        {children}
    </SettingsSaveContext.Provider>
}