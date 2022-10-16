const fs = require("fs")
const childprocess = require("child_process")

const package = JSON.parse(fs.readFileSync("./package.json", "utf-8"))
const makers = package.config.forge.makers.map(e => e.name)

import("inquirer").then(inquirer => {
    const prompt = inquirer.createPromptModule()
    prompt([{
        type: "checkbox",
        choices: makers,
        name: "selection"
    }]).then(e => {
        const selection = e["selection"]
        const args = [ "make", "--targets", selection.join(",")].join(" ")
        const x = childprocess.exec(`yarn ${args}`)
        x.stdout.pipe(process.stdout);
        x.stderr.pipe(process.stderr);
        process.stdin.pipe(x.stdin)
    })
})
