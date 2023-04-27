import { Flex } from '@chakra-ui/react'
import React, { useContext, useEffect, useRef } from 'react'
import { BiMoviePlay } from 'react-icons/bi'
import { ImCompass2 } from "react-icons/im"
import { TitlebarContext } from 'src/components/titlebar/TitleBarProvider'
import CliptureIcon from '../page/icon'
import SidebarItem from './item'
import { FaVideo } from 'react-icons/fa'

export type SidebarProps = {
    disabled?: boolean,
     active?: "dashboard" | "discover" | "recording"
}

export default function Sidebar({ disabled, active }: SidebarProps) {
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
            w='4rem'
            position='fixed'
            top='0'
            left='0'
            zIndex={10000}
            ref={ref}
            bg='page.bg.secondary'
            h='100%'
            flexDir='column'
            pt='2'
            gap='10'
        >
            <CliptureIcon alignSelf='center' boxSize='40px' />
            <Flex
                h='100%'
                w='100%'
                alignItems='center'
                flexDir='column'
                gap='5'
                display={disabled ? "none" : "inherit"}
            >
                <SidebarItem svg={BiMoviePlay}  enabled={active === "dashboard" }/>
                <SidebarItem svg={ImCompass2}  enabled={active === "discover" }/>
                <SidebarItem svg={FaVideo}  enabled={active === "recording" }/>
            </Flex>
        </Flex>
        {/* This element is for things to be sized nicely*/}
        <Flex h='100%' ref={contentRef}>

        </Flex>
    </>
}