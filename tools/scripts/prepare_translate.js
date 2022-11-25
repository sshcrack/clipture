const _ = require("lodash")
const fs = require("fs")
const fsExtra = require("fs-extra")
const path = require("path")

const outDir = path.join(process.cwd(), "translationFiles")
const locales = path.join(process.cwd(), "src", "locales")
const enFilePath = path.join(locales, "en.json")
const listFilePath = path.join(locales, "list.json")

if (fs.existsSync(outDir)) {
    if (!process.argv.includes("--force")) {
        console.error("translationFiles folder already exists. Use --force flag to force deleting")
        process.exit(-1)
    } else {
        console.log("Deleting translationFiles directory. (--force flag used)")
        fs.rmSync(outDir, { recursive: true })
    }

}

fs.mkdirSync(outDir, { recursive: true })
if (!fs.existsSync(enFilePath)) {
    console.error("Original english translations not found. (path: ", enFilePath, ")")
    process.exit(-1)
}

if (!fs.existsSync(listFilePath)) {
    console.log("List file of locales not found. Exiting... (path: ", listFilePath, ")")
    process.exit(-1)
}



const enFile = JSON.parse(fs.readFileSync(enFilePath, "utf-8"))
const listFile = Object.keys(JSON.parse(fs.readFileSync(listFilePath, "utf-8")))

const toMerge = listFile.filter(e => e !== "en")
const languageFilePaths = toMerge.map(e => path.join(locales, e + ".json"))
for (const langPath of languageFilePaths) {
    if (!fs.existsSync(langPath)) {
        console.error(`Language in list.json given, but not found (path: ${langPath})`)
        process.exit(-1)
    }

    const langFile = JSON.parse(fs.readFileSync(langPath, "utf-8"))
    const baseLangName = path.basename(langPath)

    const outFile = path.join(outDir, baseLangName)
    const merged = _.merge(enFile, langFile)

    console.log("Writing merged language file", baseLangName)
    fs.writeFileSync(outFile, JSON.stringify(merged, null, 4))
}
