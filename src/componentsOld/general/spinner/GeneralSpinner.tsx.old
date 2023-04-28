import React, { CSSProperties, DetailedHTMLProps, HTMLAttributes } from "react"
import { getCSSVariable } from '@general/tools';
import { HashLoader } from "react-spinners"
import { Flex, Text } from '@chakra-ui/react';

export declare type LengthType = number | string;
interface LoaderSizeProps extends DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
    color?: string;
    loading?: boolean;
    cssOverride?: CSSProperties;
    speedMultiplier?: number;
    size?: LengthType;
    loadingText?: string
}

export default function GeneralSpinner({ loadingText, ...props}: LoaderSizeProps) {
    const color = getCSSVariable("--chakra-colors-brand-primary")
    const loader = <HashLoader {...props} color={color} />
    if (!loadingText)
        return loader

    return <Flex
        alignItems='center'
        justifyContent='center'
        gap='1rem'
    >
        {loader}
        <Text fontSize='2xl'>{loadingText}</Text>
    </Flex>
}