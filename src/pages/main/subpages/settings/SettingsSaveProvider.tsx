import React, { useState } from 'react';
import { v4 as uuid } from "uuid"
import { RenderLogger } from 'src/interfaces/renderLogger';

type Listener = () => Promise<unknown>

export type SettingsSaveState = {
    addSaveListener: (callback: Listener) => () => void,
    save: () => Promise<unknown>,
    saving: boolean,
    addModified: (str: string) => void,
    removeModified: (str: string) => void,
    reset: () => void
    modified: boolean
}
export const SettingsSaveContext = React.createContext<SettingsSaveState>({
    addSaveListener: () => (() => {/**/ }),
    save: () => Promise.resolve(),
    saving: false,
    modified: false,
    addModified: () => {/**/ },
    removeModified: () => {/**/ },
    reset: () => {/**/ }
})

const log = RenderLogger.get("Main", "Settings", "SettingsSaveProvider")
export default function SettingsSaveProvider({ children }: React.PropsWithChildren) {
    const [listeners] = useState(new Map<string, Listener>())
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
        const err = await Promise.all(
            Array.from(listeners.values())
                .map(e => e())
        )
            .then(() => undefined)
            .catch(e => e)

        setSaving(false)
        if (err) {
            log.error(err?.stack ?? err?.message ?? err)
            throw err
        }
        setModified([])
    }

    const reset = () => setModified([])

    return <SettingsSaveContext.Provider
        value={{
            addSaveListener: c => {
                const id = uuid()
                listeners.set(id, c)
                return () => {
                    listeners.delete(id)
                }
            },
            modified: modified.length !== 0,
            saving,
            addModified,
            removeModified,
            save,
            reset
        }}
    >
        {children}
    </SettingsSaveContext.Provider>
}