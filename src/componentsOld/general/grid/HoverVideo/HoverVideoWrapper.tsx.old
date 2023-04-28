import { FlexProps } from '@chakra-ui/react';
import React from "react";
import HoverVideo from '.';
import HoverVideoProvider from './HoverVideoProvider';
import HoverVideoTrigger from './HoverVideoTrigger';

export default function HoverVideoWrapper({ cloudId, source, onClick, ...props }: { source: string, cloudId?: string } & FlexProps) {
    return <HoverVideoProvider>
        <HoverVideoTrigger {...props}>
            <HoverVideo cloudId={cloudId} source={source} flex='1' onClick={onClick ?? null}>
                {props.children}
            </HoverVideo>
        </HoverVideoTrigger>
    </HoverVideoProvider>
}