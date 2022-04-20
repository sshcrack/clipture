export class Globals {
    static baseUrl = isDev() ? "http://localhost:3001" : "https://clipture.sshcrack.me"
    static gameUrl = this.baseUrl + "/api/game/detection"
}

function isDev() {
    return process.argv[2] === "dev"
}