import { Flex, FlexProps } from '@chakra-ui/react';
import React, { useContext } from 'react';
import { HoverVideoContext } from './HoverVideoProvider';

export default function HoverVideoTrigger(props: FlexProps) {
    const { setHovered } = useContext(HoverVideoContext)

    return <Flex
        {...props}
        onMouseEnter={() => { setHovered(true); console.log("Hovered true")}}
        onMouseLeave={() => { setHovered(false); console.log("Hovered false")}}
    >
        {props.children}
    </Flex>
}