if (typeof window === "undefined")
    throw new Error("RenderLogger can only be used in the rendering process.")

if(typeof window.log === "undefined")
    throw new Error("window.log has to be defined in order for the RenderLogger to work.")
export class RenderLogger {
    static formatScope(arr: string[]) {
        return arr.join(":")
    }

    static get(...name: string[]) {
        const logger = window.log
            .scope(RenderLogger.formatScope(name))

        return logger
    }
}