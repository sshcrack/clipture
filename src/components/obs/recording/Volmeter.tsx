import { Flex, FlexProps } from '@chakra-ui/react'
import { ExpFilter } from '@general/ExpFilter'
import React, { useEffect, useRef, useState } from "react"

export default function Volmeter(props: FlexProps) {
    const { audio } = window.api
    const outerVolmeter = useRef<HTMLDivElement>(null)
    const [sources, setSources] = useState(undefined as string[])

    useEffect(() => {
        console.log("Getting sources...")
        audio.sources()
            .then(s => {
                setSources(s)
                console.log("Setting sources")
            })
    }, [])

    useEffect(() => {
        console.log(sources, outerVolmeter, sources === undefined, !outerVolmeter.current)
        if (!outerVolmeter.current || sources === undefined) {
            console.log("Return")
            return
        }

        const box = outerVolmeter.current
        box.innerHTML = ""

        const map = new Map<string, HTMLDivElement>()
        const filters = new Map<string, ExpFilter>()

        const addSource = () => {
            const outerBar = document.createElement("div")
            outerBar.setAttribute("style", `
                height: 1em;
                width: 100%;
                background: var(--chakra-colors-gray-500);
                display: flex;
                justify-content: start;
                align-items: center;
                border-radius: var(--chakra-radii-xl);
            `)

            const innerBar = document.createElement("div")
            innerBar.setAttribute("style", `
            background: var(--chakra-colors-green-300);
            height: 100%;
            border-radius: var(--chakra-radii-xl);
            `)
            innerBar.style.background = "var(--chakra-colors-green-300)"
            innerBar.style.height = "100%"
            innerBar.style

            outerBar.appendChild(innerBar)
            box.appendChild(outerBar)
            return innerBar
        }

        sources.forEach(e => map.set(e, addSource()))
        sources.forEach(e => filters.set(e, new ExpFilter(0, 0.2, 0.2)))

        console.log(sources.length, "audio sources detected.")
        return audio.onVolmeterChange((source, m) => {
            const avg = Math.abs(m.reduce((a, b) => a + b, 0) / m.length);
            const max = Math.min(1, avg / 60)
            const bar = map.get(source)

            const filter = filters.get(source)
            const newVal = filter.update(1 - max)
            bar.style.width = `${newVal * 100}%`
        })
    }, [outerVolmeter, sources])

    return <Flex {...props} ref={outerVolmeter}/>
}