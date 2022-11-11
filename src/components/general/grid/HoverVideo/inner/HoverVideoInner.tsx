import { Flex } from '@chakra-ui/react';
import React from "react"

export type HoverVideoInnerProps = {

}

export default function HoverVideoInner({ children }: React.PropsWithChildren<HoverVideoInnerProps>) {
    return <Flex
        gridRow='1'
        gridColumn='1'
        w='100%'
        h='100%'
        justifyContent='start'
        alignItems='end'
    >
        {children}
    </Flex>
}