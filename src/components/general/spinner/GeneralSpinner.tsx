import React, { CSSProperties, DetailedHTMLProps, HTMLAttributes } from "react"
import { getCSSVariable } from '@general/tools';
import { HashLoader } from "react-spinners"

export declare type LengthType = number | string;
interface LoaderSizeProps extends DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
    color?: string;
    loading?: boolean;
    cssOverride?: CSSProperties;
    speedMultiplier?: number;
    size?: LengthType;
}

export default function GeneralSpinner(props: LoaderSizeProps) {
    const color = getCSSVariable("--chakra-colors-brand-primary")
    return <HashLoader {...props} color={color}/>
}