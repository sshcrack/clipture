import { Flex, list } from '@chakra-ui/react'
import React, { useContext, useEffect, useRef } from 'react'
import { TitlebarContext } from 'src/components/titlebar/TitleBarProvider'
import CliptureIcon from '../page/icon'

export type SidebarProps = {
    disabled?: boolean
}

export default function Sidebar({ disabled }: SidebarProps) {
    const { setSidebar, setUpdate } = useContext(TitlebarContext)
    const ref = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const listener = () => {
            setSidebar(ref.current)
            if (contentRef.current)
                contentRef.current.style.width = ref.current.clientWidth + "px"
            setUpdate(Math.random())
        }

        window.addEventListener("resize", listener)
        listener();
        return () => {
            setSidebar(null)
            window.removeEventListener("resize", listener)
        }
    }, [ref, contentRef])


    return <>
        <Flex
            w='3rem'
            position='fixed'
            top='0'
            left='0'
            zIndex={10000}
            ref={ref}
            bg='page.bg.secondary'
            h='100%'
            justifyContent='center'
            dir='column'
            pt='2'
        >
            <CliptureIcon boxSize='29px' />
        </Flex>
        {/* This element is for things to be sized nicely*/}
        <Flex h='100%' ref={contentRef}>

        </Flex>
    </>
}