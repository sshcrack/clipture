export function getAddRemoveListener<T>(callback: T, listeners: T[]) {
    listeners.push(callback)

    return () => {
        const index = listeners.indexOf(callback)
        if (index === -1)
            return console.error("Could not remove manual listener")

        listeners.splice(index, 1)
    }
}