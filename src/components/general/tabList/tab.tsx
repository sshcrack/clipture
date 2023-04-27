import { Flex } from '@chakra-ui/react';
import React, { PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import { TabListContext } from '.';

export type TabProps = PropsWithChildren<{
    active?: boolean
}>

export default function Tab({ active, children }: TabProps) {
    const ref = useRef<HTMLDivElement>(null)
    const { addTabHook, setTabActive, tabSize } = useContext(TabListContext)
    const [update, setUpdate] = useState(Math.random())

    useEffect(() => {
        if (!ref.current)
            return

        if (active)
            setTabActive(ref.current)
    }, [active, ref, update])

    useEffect(() => {
        if (!ref.current)
            return


        const out = addTabHook(ref.current)
        setUpdate(Math.random())

        return out;
    }, [ref])


    return <Flex
        ref={ref}
        cursor='pointer'
        pl={tabSize}
        pr={tabSize}
        pt='3'
        pb='3'
        h='100%'
        justifyContent='center'
        alignItems='center'
        rounded='md'
        _hover={{
            bg: 'rgba(255, 255, 255, 0.1)'
        }}
        transition='.1s background ease-in-out'
    >
        {children}
    </Flex>
}