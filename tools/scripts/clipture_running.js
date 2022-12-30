(async () => {
    const execa = (await import("execa")).execa
    const list = await execa("tasklist")
    if(list.stdout.includes("clipture.exe")) {
        console.log("-----------------------------------------------")
        console.log("           ATTENTION")
        console.log("-----------------------------------------------")
        console.log(" Clipture is already running, meaning this instance will launch the other")
    }
})()