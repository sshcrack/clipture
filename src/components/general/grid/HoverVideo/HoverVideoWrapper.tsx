import { FlexProps } from '@chakra-ui/react';
import React from "react";
import HoverVideo from '.';
import HoverVideoProvider from './HoverVideoProvider';
import HoverVideoTrigger from './HoverVideoTrigger';

export default function HoverVideoWrapper({ source, bookmarks, ...props }: { source: string, bookmarks?: number[] } & FlexProps) {
    return <HoverVideoProvider>
        <HoverVideoTrigger {...props}>
            <HoverVideo source={source} bookmarks={bookmarks} flex='1' />
        </HoverVideoTrigger>
    </HoverVideoProvider>
}