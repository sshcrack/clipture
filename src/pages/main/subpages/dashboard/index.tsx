import { SessionData, SessionInfo } from '@backend/managers/auth/interfaces';
import { Flex, Text } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Page from 'src/components/general/page';
import TabList from 'src/components/general/tabList';
import Tab from 'src/components/general/tabList/tab';
import CloudIndicator from 'src/components/dashboard/CloudIndicator';
import NavBar from 'src/componentsOld/general/NavBar';
import Clips from 'src/componentsOld/obs/clips';
import ClipProcessingItems from 'src/componentsOld/obs/progress/ClipProgressItems';
import Videos from 'src/componentsOld/obs/videos';
import "src/pages/main/subpages/dashboard/index.css";


//TODO: Add Illustration credits to settings
export default function DashboardPage({ info }: { info: SessionInfo }) {
    const [currentPage, setCurrentPage] = useState(0)
    const [initialized, setInitialized] = useState(false)
    const [resizeUpdate, setResizeUpdate] = useState(0)
    const navbarRef = useRef<HTMLDivElement>()
    const outerRef = useRef<HTMLDivElement>()

    const { system } = window.api
    const { data } = info
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
    return <Page
        sidebar='dashboard'
        noPadding
    >
        <CloudIndicator />
        <Flex p='6' pl='8'>
            <Text fontSize='2xl'>Recorded clips</Text>
        </Flex>
        <TabList pl='20'>
            <Tab active>All Clips</Tab>
            <Tab>Local</Tab>
            <Tab>Uploaded</Tab>
            <Tab>Videos</Tab>
        </TabList>
    </Page>
}