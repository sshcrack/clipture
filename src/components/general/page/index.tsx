import React, { PropsWithChildren } from 'react';
import { Flex, FlexProps } from '@chakra-ui/react';
import Sidebar, { SidebarProps } from '../sidebar';

export type PageProps = FlexProps & {
    sidebar: "disabled" | "none" | SidebarProps["active"],
    noPadding?: boolean
}

// eslint-disable-next-line @typescript-eslint/ban-types
export default function Page({ noPadding, children, sidebar, ...props }: PropsWithChildren<PageProps>) {
    return <Flex
        {...props}
        flexDir='row'
        w='100%'
        h='100%'
        bgGradient='linear(to right bottom, page.bg.0 0%, page.bg.1 25.71%, page.bg.2 100%)'
    >
        {sidebar !== "none" && <Sidebar active={sidebar !== "disabled" ? sidebar : null} disabled={sidebar === "disabled"} />}
        <Flex
            w='100%'
            h='100%'
            p={!noPadding && '6'}
            pl={!noPadding && '8'}
            flexDir='column'
            {...props}
        >
            {children}
        </Flex>
    </Flex>
}