const fs = require("fs")
const crypto = require("crypto")
const [,, filePath] = process.argv

console.log("Output with path", filePath)
const read = fs.readFileSync(filePath)
console.log(crypto.createHash("sha256").update(read).digest("hex"))