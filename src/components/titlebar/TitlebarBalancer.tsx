import { Box, BoxProps } from '@chakra-ui/react';
import React, { useContext } from 'react';
import { TitlebarContext } from './TitleBarProvider';

export default function TitlebarBalancer(p: BoxProps) {
    const { size } = useContext(TitlebarContext)
    return <Box height={`calc(100% - ${size})`} width="100%" {...p}>
        {p.children}
    </Box >
}