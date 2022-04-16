export class Globals {
    static baseUrl = isDev() ? "http://localhost:3001" : "https://clipture.sshcrack.me"
}

function isDev() {
    return process.argv[2] === "dev"
}