import { FlexProps } from '@chakra-ui/react';
import React from "react";
import HoverVideo from '.';
import HoverVideoProvider from './HoverVideoProvider';
import HoverVideoTrigger from './HoverVideoTrigger';

export default function HoverVideoWrapper({ cloudId, source, bookmarks, onClick, ...props }: { source: string, bookmarks?: number[], cloudId?: string } & FlexProps) {
    return <HoverVideoProvider>
        <HoverVideoTrigger {...props}>
            <HoverVideo cloudId={cloudId} source={source} bookmarks={bookmarks} flex='1' onClick={onClick ?? null} />
        </HoverVideoTrigger>
    </HoverVideoProvider>
}