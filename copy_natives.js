//! No longer needed as it is handled in the script itself.
return


const fs = require("fs/promises")
const path = require("path")


const native = "node_modules/@streamlabs/obs-studio-node"
module.exports = async (buildPath, _, _1, _2, callback) => {
    const src = path.join(__dirname, native)
    const dst = path.join(buildPath, "resources", "app", native)

    console.log("Copying from", src, "to", dst)
    await fs.cp(src, dst, { recursive: true })
    console.log("Done")
    callback()
}