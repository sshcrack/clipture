import "src/components/general/gradientLoader/gradientLoader.css"
import { Box } from '@chakra-ui/react'
import React from "react"

export default function GradientLoader({ size, gradient, percent }: { percent: number, size: string, gradient: [string, string] }) {
    const [first, second] = gradient
    return <Box className="gradientLoader gradientLoaderLinear" w={size} h={size} style={{
        "--gradient-first": first,
        "--gradient-second": second,
        "--gradient-percentage": `${percent * 100}%`
    } as any}>
        <span className='gradientLoaderLinear'></span>
        <span className='gradientLoaderLinear'></span>
        <span className='gradientLoaderLinear'></span>
        <span className='gradientLoaderLinear'></span>
    </Box>
}