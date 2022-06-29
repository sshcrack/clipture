import { SessionData } from '@backend/managers/auth/interfaces';
import { Flex, Heading } from '@chakra-ui/react';
import { ExpFilter } from '@general/ExpFilter';
import React, { useEffect, useRef, useState } from "react";
import { NavBar } from 'src/components/general/NavBar';
import Preview from 'src/components/obs/videos/preview';

export default function RecordPage({ data }: { data: SessionData }) {
    const { obs, audio } = window.api
    const [recording, setRecording] = useState(() => window.api.obs.isRecording())
    const [sources, setSources] = useState(undefined as string[])
    const [recordDesc, setRecordDesc] = useState("Unknown")
    const outerVolmeter = useRef<HTMLDivElement>(null)

    useEffect(() => {
        console.log("Getting sources...")
        audio.sources()
            .then(s => {
                setSources(s)
                console.log("Setting sources")
            })

        return obs.onRecordChange(r => {
            setRecording(r)
            setRecordDesc(obs.recordDescription())
        })
    }, [])

    useEffect(() => {
        console.log("Rerender voltmeter", outerVolmeter)
    }, [outerVolmeter])

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

    console.log("Rerender record")
    return <Flex
        w='100%'
        h='100%'
    >
        <NavBar
            data={data}
            w='5em'
            h='100%'
        />
        <Flex
            w='100%'
            h='100%'
            flexDir='column'
            justifyContent='start'
            alignItems='center'
        >
            <Heading>Recording Overview</Heading>
            {!recording && <Heading size='md'>Not recording</Heading>}
            <Heading size="md">{recordDesc}</Heading>
            <Flex
                w='100%'
                flex='1'
                h='100%'
                justifyContent='center'
                alignItems='center'
                flexDir='column'
            >
                <Flex
                    w='auto'
                    h='100%'
                    style={{
                        aspectRatio: "16 / 9"
                    }}
                    justifyContent='center'
                    alignItems='center'
                >
                    {recording && <Preview />}
                </Flex>
                <Flex
                    mt='5'
                    mb='5'
                    w='80%'
                    h='100%'
                    flex='0'
                    gap='1em'
                    flexDir='column'
                    ref={outerVolmeter}
                />
            </Flex>
        </Flex>
    </Flex>
}