import { Box } from '@chakra-ui/react'
import React from "react"
import "src/components/obs/clips/gradientLoader.css"

export default function GradientLoader({ size, gradient, percent}: {percent: number, size: string, gradient: [ string, string, string]}) {
    const [first, second, third] = gradient
    return <Box className="gradientLoader gradientLoaderLinear" w={size} h={size} style={{
        "--gradient-first": first,
        "--gradient-second": second,
        "--gradient-third": third,
        "--gradient-percentage": `${percent * 100}%`
    } as any}>
        <span className='gradientLoaderLinear'></span>
        <span className='gradientLoaderLinear'></span>
        <span className='gradientLoaderLinear'></span>
        <span className='gradientLoaderLinear'></span>
    </Box>
}