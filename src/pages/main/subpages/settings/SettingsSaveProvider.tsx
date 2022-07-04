import React, { useState } from 'react';

type Listener = () => Promise<unknown>

export type SettingsSaveState = {
    addSaveListener: (callback: Listener) => () => void,
    save: () => Promise<unknown>,
    saving: boolean,
    addModified: (str: string) => void,
    removeModified: (str: string) => void,
    modified: boolean
}
export const SettingsSaveContext = React.createContext<SettingsSaveState>({
    addSaveListener: () => (() => { }),
    save: () => Promise.resolve(),
    saving: false,
    modified: false,
    addModified: () => { },
    removeModified: () => { }
})

export default function SettingsSaveProvider({ children }: React.PropsWithChildren) {
    const [listeners, setListeners] = useState([] as Listener[])
    const [modified, setModified] = useState([] as string[])
    const [saving, setSaving] = useState(false)

    const addModified = (s: string) => {
        const newModified = [s, ...modified.filter(e => e !== s)]
        console.log("New Modified is", newModified)
        setModified(newModified)
    }

    const removeModified = (s: string) => {
        const newModified = modified.filter(e => e !== s)
        console.log("New Modified is", newModified, "sorting", s)
        setModified([...newModified])
    }

    const save = async () => {
        setSaving(true)
        const err = await Promise.all(listeners.map(e => e()))
            .then(() => undefined)
            .catch(e => e)

        setSaving(false)
        if (err)
            throw err
        setModified([])
    }

    return <SettingsSaveContext.Provider
        value={{
            addSaveListener: c => {
                listeners.push(c)
                setListeners([...listeners])
                return () => {
                    listeners.splice(listeners.indexOf(c), 1)
                    setListeners([...listeners])
                }
            },
            modified: modified.length !== 0,
            saving,
            addModified,
            removeModified,
            save
        }}
    >
        {children}
    </SettingsSaveContext.Provider>
}