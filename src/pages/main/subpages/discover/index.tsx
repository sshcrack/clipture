import { SessionInfo, SessionStatus } from '@backend/managers/auth/interfaces';
import { Button, Flex } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import DiscoverList from 'src/componentsOld/discover/list/DiscoverList';
import DiscoverProvider from 'src/componentsOld/discover/list/DiscoverProvider';
import DiscoverSearch from 'src/componentsOld/discover/list/DiscoverSearch';
import SingleDiscoverPage from 'src/componentsOld/discover/single/SingleProvider';
import NavBar from 'src/componentsOld/general/NavBar';
import OfflinePlaceholder from 'src/componentsOld/general/placeholder/OfflinePlaceholder';

export type DiscoverDisplayType = "single" | "list"

export default function DiscoverPage({ info, type }: { info: SessionInfo, type?: DiscoverDisplayType }) {
    const { t } = useTranslation("discover", { keyPrefix: "button" })
    const { status, data } = info

    const [resizeUpdate, setResizeUpdate] = useState(0)
    const discoverRef = useRef<HTMLDivElement>(null)
    const navbarRef = useRef<HTMLDivElement>()

    if (!type)
        type = localStorage.getItem("discover-page-default") === "list" ? "list" : "single"


    useEffect(() => {
        if (!navbarRef?.current || !discoverRef?.current)
            return

        const height = navbarRef.current.clientHeight
        console.log("Setting height")
        discoverRef.current.style.height = `calc(${height}px, var(--chakra-space-5))`
    }, [navbarRef, discoverRef, resizeUpdate])

    useEffect(() => {
        const listener = () => {
            setResizeUpdate(Math.random())
        }

        window.addEventListener("resize", listener)
        return () => window.removeEventListener("resize", listener)
    }, [])

    const oppositeType = type === "list" ? "single" : "list"


    const comps = status === SessionStatus.OFFLINE ?
        <OfflinePlaceholder /> :
        <>
            <Flex w='100%'>
                <Button
                    colorScheme='teal'
                    onClick={() => {
                        localStorage.setItem("discover-page-default", oppositeType)
                        location.hash = `#/discover/${oppositeType}`
                    }}
                >{t(oppositeType)}</Button>
                {type === "list" && <DiscoverSearch />}
            </Flex>
            <Flex
                w='100%'
                h='100%'
                justifyContent='center'
                alignItems='center'
                overflowY='hidden'
            >
                {type === "list" ? <DiscoverList /> : <SingleDiscoverPage />}
            </Flex>
        </>

    return <DiscoverProvider>
        <Flex
            h='100%'
            w='100%'
            gap='4'
        >
            <NavBar
                data={data}
                w='5em'
                h='100%'
                ref={navbarRef}
            />
            <Flex
                w='100%'
                h='100%'
                justifyContent='center'
                alignItems='start'
                flexDir='column'
                pt='3'
                pb='5'
                gap='4'
                ref={discoverRef}
            >
                {comps}
            </Flex>
        </Flex>
    </DiscoverProvider>
}