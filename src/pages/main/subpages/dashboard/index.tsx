import { SessionData } from '@backend/managers/auth/interfaces';
import { Flex, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import NavBar from 'src/components/general/NavBar';
import Clips from 'src/components/obs/clips';
import ClipProcessingItems from 'src/components/obs/progress/ClipProgressItems';
import Videos from 'src/components/obs/videos';
import "src/pages/main/subpages/dashboard/index.css";


//TODO: Add Illustration credits to settings
export default function DashboardPage({ data }: { data: SessionData }) {
    const [currentPage, setCurrentPage] = useState(0)
    const [initialized, setInitialized] = useState(false)
    const [resizeUpdate, setResizeUpdate] = useState(0)
    const navbarRef = useRef<HTMLDivElement>()
    const outerRef = useRef<HTMLDivElement>()

    const { system } = window.api
    const { mode } = useParams()
    const { t } = useTranslation("dashboard")

    useEffect(() => {
        if (!initialized)
            return

        console.log("Default page update to", currentPage)
        system.set_default_dashboard_page(currentPage)
    }, [currentPage])

    useEffect(() => {
        if (!navbarRef?.current || !outerRef?.current)
            return

        const height = navbarRef.current.clientHeight
        console.log("Setting height")
        outerRef.current.style.height = `${height}px`
    }, [navbarRef, outerRef, resizeUpdate])

    useEffect(() => {
        const listener = () => {
            setResizeUpdate(Math.random());
            console.log("Resize")
        }
        window.addEventListener("resize", listener)
        return () => window.removeEventListener("resize", listener)
    }, [])

    useEffect(() => {
        console.log("Mode is", mode)
        if (mode)
            return setCurrentPage(mode === "videos" ? 1 : 0)

        system.get_dashboard_page_default().then(e => {
            setCurrentPage(e)
            setInitialized(true)
        })
    }, [])

    const additionalElements = ClipProcessingItems()
    return <Flex
        gap={4}
        flexDir='row'

        width='100%'
        height='100%'
    >
        <NavBar
            data={data}
            w='5em'
            h='100%'
            ref={navbarRef}
        />
        <Flex
            flexDir='column'
            alignItems='center'
            w='100%'
            h='100%'
            ref={outerRef}
        >
            <Tabs
                w='100%'
                h='calc(100% - var(--chakra-space-5))'
                isLazy
                overflowY='hidden'
                display='flex'
                flexDir='column'
                isFitted
                index={currentPage}
                onChange={newIndex => {
                    setCurrentPage(newIndex)
                    console.log("Pushing state")
                    if (newIndex === 0)
                        history.pushState(null, null, '#/clips');
                    else
                        history.pushState(null, null, '#/videos');
                }}
            >
                <TabList>
                    <Tab className='tabHotkey select-everything'>{t("clips.title")}</Tab>
                    <Tab className='tabHotkey select-everything'>{t("videos.title")}</Tab>
                </TabList>
                <TabPanels
                    display='flex'
                    w='100%'
                    h='100%'
                    flexDir='column'
                    justifyContent='center'
                    alignItems='center'
                >
                    <TabPanel
                        display='flex'
                        w='100%'
                        className='select-everything'
                        h='100%'
                        flexDir='column'
                        justifyContent='center'
                        alignItems='center'
                        pb='0'
                        pt='0'
                    >
                        <Clips additionalElements={additionalElements} />
                    </TabPanel>
                    <TabPanel
                        display='flex'
                        w='100%'
                        h='100%'
                        className='select-everything'
                        flexDir='column'
                        justifyContent='center'
                        alignItems='center'
                        pb='0'
                        pt='0'
                    >
                        <Videos additionalElements={additionalElements} />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Flex>
    </Flex>
}