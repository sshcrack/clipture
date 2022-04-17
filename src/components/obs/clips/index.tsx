import type { WindowInformation } from '@backend/managers/obs/Scene/interfaces';
import { Button, Flex, FormControl, FormLabel, Input } from '@chakra-ui/react';
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { RenderLogger } from 'src/interfaces/renderLogger';

const log = RenderLogger.get("obs", "clips")
export default function Clips() {
    const { obs } = window.api
    const preview = useRef<HTMLDivElement>()
    const [availableMonitors, setAvailableMonitors] = useState(NaN)
    const [availableWindows, setAvilableWindows] = useState<WindowInformation[]>(null)

    const [previewHeight, setPreviewHeight] = useState(0)
    const resize = () => {
        if (!preview.current)
            return

        const { width, height, x, y } = preview.current.getBoundingClientRect()
        log.log("Resizing...", width, height, x, y)
        obs.resize_preview({ width, height, x, y })
            .then(({ height }) => setPreviewHeight(height))
    }
    useEffect(() => {
        if (!preview?.current)
            return


        const { width, height, x, y } = preview.current.getBoundingClientRect()
        obs.preview_init({ width, height, x, y })
            .then(result => {
                log.log("Setting", result)
                setPreviewHeight(result.height)
            })

    }, [preview])

    useEffect(() => {
        obs.available_monitors()
            .then(res => setAvailableMonitors(res))

        window.addEventListener("resize", () => {
            log.log("Resize event")
            resize()
        })

        obs.available_windows(true)
            .then(res => setAvilableWindows(res))
    }, [])

    useEffect(() => {
        resize()
    })

    const buttons = [] as ReactNode[]

    if (availableMonitors !== NaN) {
        for (let i = 0; i < availableMonitors; i++) {
            buttons.push(<Button key={'btn' + i} onClick={() => obs.switch_desktop(i)}>{i}</Button>)
        }
    }

    if (availableWindows) {
        availableWindows.forEach(e => {
            return buttons.push(<Button key={'btnwindow' + JSON.stringify(e)} onClick={() => obs.switch_game(e)}>{e.executable}</Button>)
        })
    }

    return <Flex
        justifyContent='start'
        alignItems='center'
        w='100%'
        h='100%'
    >
        {buttons}
        <Flex
            className='previewContainer'
            ref={preview}
            style={{ height: "100%", width: "100%" }}
        >
        </Flex>
    </Flex>
}