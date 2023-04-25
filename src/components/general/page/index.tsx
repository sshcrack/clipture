import React, { PropsWithChildren } from 'react';
import { Flex, FlexProps } from '@chakra-ui/react';
import Sidebar from '../sidebar';

export type PageProps = FlexProps & {
    sidebar: "disabled"
}

// eslint-disable-next-line @typescript-eslint/ban-types
export default function Page({ children, sidebar, ...props }: PropsWithChildren<PageProps>) {
    return <Flex
        {...props}
        dir='row'
        w='100%'
        h='100%'
        bgGradient='linear(to right bottom, page.bg.0 0%, page.bg.1 25.71%, page.bg.2 100%)'
    >
        <Sidebar />
        <Flex
            w='100%'
            h='100%'
            pl='7'
            pb='3'
            pt='3'
            pr='7'
            dir='column'
            {...props}
        >
            {children}
        </Flex>
    </Flex>
}