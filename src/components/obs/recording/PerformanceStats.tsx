import { Flex, Spinner, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from "react";
import { Line } from 'react-chartjs-2';
import test from "chart.js"
import prettyMS from "pretty-ms"
import { RenderLogger } from 'src/interfaces/renderLogger';
import { PerformanceStatistics } from 'src/types/obs/obs-studio-node';


type PerformanceWithDate = PerformanceStatistics & {
    time: number
}
type LineChartData = Parameters<typeof Line>[0]["data"]
type LineChartOptions = Parameters<typeof Line>[0]["options"]


const cpuOptions = {
    responsive: true,
    scales: {
        xAxes: {
            grid: {
                color: "gray"
            },
            ticks: {
                color: "#a5a5a5",
            }
        },
        yAxes: {
            grid: {
                color: "gray"
            },
            ticks: {
                color: "#a5a5a5",
                callback: (val) => {
                    return val + "%"
                },
            }
        }
    }
} as LineChartOptions

const fpsOptions = {
    ...cpuOptions,
    scales: {
        ...cpuOptions.scales,
        yAxes: {
            ...cpuOptions.scales.yAxes,
            ticks: {
                ...cpuOptions.scales.yAxes.ticks,
                callback: (e: string) => e
            }
        }
    }
} as LineChartOptions

export default function PerformanceStatistics() {
    const [stats, setStats] = useState([] as PerformanceWithDate[])
    const { obs } = window.api

    useEffect(() => {
        let stats = [] as PerformanceWithDate[]
        return obs.onPerformanceReport(e => {
            stats.push({
                ...e,
                time: Date.now()
            })
            if (stats.length > 15)
                stats.shift()

            setStats([...stats])
        })
    }, [])

    if (!stats)
        return <Spinner />

    const dataColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--chakra-colors-brand-secondary');

    const last = stats?.[stats.length -1]
    const labels= stats.map(e => prettyMS(last.time - e.time))

    const cpuData = {
        labels: labels,
        datasets: [{
            label: "CPU in %",
            data: stats.map(e => e.CPU),
            borderColor: dataColor,
            backgroundColor: dataColor
        }]
    } as LineChartData

    const fpsData = {
        labels: labels,
        datasets: [{
            label: "FPS",
            data: stats.map(e => e.frameRate),
            borderColor: dataColor,
            backgroundColor: dataColor
        }]
    } as LineChartData

    return <Flex
        w='100%'
        h='100%'
        flexDir="column"
        justifyContent='center'
        alignItems='center'
    >
        <Text>CPU</Text>
        <Line data={cpuData} options={cpuOptions} />
        <Text>FPS</Text>
        <Line data={fpsData} options={fpsOptions} />
    </Flex>
}