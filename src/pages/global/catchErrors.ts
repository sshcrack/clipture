
export function addErrorCatch() {
    const listener = (e: unknown) => window.log.error(e)
    window.addEventListener("error", listener)

    return () => window.removeEventListener("error", listener)
}