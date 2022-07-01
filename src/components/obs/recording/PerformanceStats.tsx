import { Flex, Spinner, Text } from '@chakra-ui/react';
import { getCSSVariable } from '@general/tools';
import prettyBytes from "pretty-bytes";
import prettyMS from "pretty-ms";
import React, { useEffect, useState } from "react";
import { Line } from 'react-chartjs-2';
import GeneralSpinner from 'src/components/general/spinner/GeneralSpinner';
import { PerformanceStatistics } from 'src/types/obs/obs-studio-node';


type PerformanceWithDate = PerformanceStatistics & {
    time: number
}
type LineChartData = Parameters<typeof Line>[0]["data"]
type LineChartOptions = Parameters<typeof Line>[0]["options"]


const optionsWithFunc = (callback: (val: string) => string) => ({
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
                callback: callback,
            }
        }
    }
} as LineChartOptions)

const cpuOptions = optionsWithFunc(e => e + "%")
const generalOptions = optionsWithFunc(e => e)
const bandWidthOptions = optionsWithFunc(e => prettyBytes(parseFloat(e)))


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
        return <GeneralSpinner />

    const dataColor = getCSSVariable('--chakra-colors-brand-secondary')
    const last = stats?.[stats.length - 1]
    const labels = stats.map(e => prettyMS(last.time - e.time))

    const cpuData = {
        labels: labels,
        datasets: [{
            label: "CPU in %",
            data: stats.map(e => Math.round(e.CPU * 100) / 100),
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

    const bandwidthData = {
        labels: labels,
        datasets: [{
            label: "Bandwidth",
            data: stats.map(e => e.recordingBandwidth),
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
        <Line data={fpsData} options={generalOptions} />
        <Text>Bandwidth</Text>
        <Line data={bandwidthData} options={bandWidthOptions} />
    </Flex>
}