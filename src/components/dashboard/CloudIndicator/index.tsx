import { CloudUsage } from '@backend/managers/cloud/interface';
import { Flex, Progress, ProgressProps, Text } from '@chakra-ui/react';
import prettyBytes from 'pretty-bytes';
import React, { useEffect, useState } from "react";
import TitleBarItem from 'src/components/titlebar/TitleBarItem';
import "src/components/titlebar/style.css"
import "./progressColor.css"

export default function CloudIndicator() {
    const [usage, setUsage] = useState(undefined as CloudUsage)
    const { cloud } = window.api

    useEffect(() => {
        cloud.usage()
            .then(e => setUsage(e))

        return cloud.addUsageListener(e => setUsage(e))
    }, [])


    const percentage = !usage ? 0 : usage.current / usage.maxTotal
    const color = `hsl(${120 * (1 - percentage)}, 100%, 70%)`

    const progGeneral = {
        w: '50%',
        max: 1,
        rounded: 'md',
        className: 'progress-color',
    } as ProgressProps

    const prettierUsed = usage && prettyBytes(usage.current)
    const prettierTotal = usage && prettyBytes(usage.maxTotal)
    const content = <>
        <Progress
            value={percentage}
            style={{
                //@ts-ignore
                "--prog-color": color
            }}
            {...progGeneral}
        />
        <Text color='white' pl='2'>{prettierUsed} / {prettierTotal}</Text>
    </>

    const placeholder = <>
        <Progress isAnimated hasStripe value={1} {...progGeneral} />
        <Text color='white' pl='2'> Loading</Text>
    </>

    return <TitleBarItem>
        <Flex w='100%' className='drag-titlebar' justifyContent='center' alignItems='center'>
            {usage ? content : placeholder}
        </Flex>
    </TitleBarItem>
} 7