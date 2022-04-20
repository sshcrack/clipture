import type { WindowInformation } from '@backend/managers/obs/Scene/interfaces';
import { Button, Flex } from '@chakra-ui/react';
import React, { ReactNode, useEffect, useState } from "react";
import { RenderLogger } from 'src/interfaces/renderLogger';
import Preview from './preview';

const log = RenderLogger.get("obs", "clips")
export default function Clips() {
    const { obs, process } = window.api
    const [availableMonitors, setAvailableMonitors] = useState(NaN)
    const [availableWindows, setAvailableWindows] = useState<WindowInformation[]>(null)


    useEffect(() => {
        obs.availableMonitors()
            .then(res => setAvailableMonitors(res))

        process.availableWindows(true)
            .then(res => setAvailableWindows(res))
    }, [])

    const buttons = [] as ReactNode[]
    if (availableMonitors !== NaN) {
        for (let i = 0; i < availableMonitors; i++) {
            buttons.push(<Button key={'btn' + i} onClick={() => obs.switchDesktop(i)}>{i}</Button>)
        }
    }

    if (availableWindows) {
        availableWindows.forEach(e => {
            return buttons.push(<Button key={'btnwindow' + JSON.stringify(e)} onClick={() => obs.switchWindow(e)}>{e.executable}</Button>)
        })
    }

    return <Flex
        justifyContent='start'
        alignItems='center'
        w='100%'
        h='100%'
    >
        <Flex w='65%'>
            {buttons}
        </Flex>
        <Preview />
    </Flex>
}