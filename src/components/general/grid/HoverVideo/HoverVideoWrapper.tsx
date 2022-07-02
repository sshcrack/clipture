import { FlexProps } from '@chakra-ui/react';
import React from "react";
import HoverVideo from '.';
import HoverVideoProvider from './HoverVideoProvider';
import HoverVideoTrigger from './HoverVideoTrigger';

export default function HoverVideoWrapper({ source, ...props }: { source: string } & FlexProps) {
    return <HoverVideoProvider>
        <HoverVideoTrigger {...props}>
            <HoverVideo source={source} flex='1' />
        </HoverVideoTrigger>
    </HoverVideoProvider>
}