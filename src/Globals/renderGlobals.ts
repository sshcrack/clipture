
const isDevCached = window.api.isDev()
export class RenderGlobals {
    static baseUrl = isDevCached ? "http://localhost:3001" : "https://clipture.sshcrack.me"
    static gameUrl = this.baseUrl + "/api/game/detection"

}