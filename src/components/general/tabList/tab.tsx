import { Flex, FlexProps } from '@chakra-ui/react';
import React, { PropsWithChildren, useContext, useRef } from 'react';
import { IndividualTabContext } from './indexProvider';

export type TabProps = PropsWithChildren<{
} & FlexProps>

export default function Tab({ children, ...props }: TabProps) {
    const ref = useRef<HTMLDivElement>(null)

    const { index, tabSize, isActive } = useContext(IndividualTabContext)
    const bg = 'rgba(255, 255, 255, 0.1)'
    return <Flex
        ref={ref}
        cursor='pointer'
        className={`tab-${index}`}
        pl={tabSize}
        pr={tabSize}
        pt='3'
        pb='3'
        h='100%'
        justifyContent='center'
        alignItems='center'
        rounded='md'
        _hover={{
            bg
        }}
        transition='.1s background ease-in-out'
        filter={isActive && 'drop-shadow(0px 0px 5px var(--chakra-colors-brand-secondary))'}
        {...props}
    >
        {children}
    </Flex>
}