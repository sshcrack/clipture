import { SessionData } from '@backend/managers/auth/interfaces';
import { Flex, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { NavBar } from 'src/components/general/NavBar';
import Clips from 'src/components/obs/clips';
import ClipProcessingItems from 'src/components/obs/progress/ClipProgressItems';
import Videos from 'src/components/obs/videos';


//TODO: Add Illustration credits to settings
export default function DashboardPage({ data }: { data: SessionData }) {
    const [currentPage, setCurrentPage] = useState(0)
    const [initialized, setInitialized] = useState(false)
    const { system } = window.api
    const { mode } = useParams()

    useEffect(() => {
        if (!initialized)
            return

        console.log("Default page update to", currentPage)
        system.set_default_dashboard_page(currentPage)
    }, [currentPage])

    useEffect(() => {
        if(mode) {
            console.log("Mode is", mode)
            return setCurrentPage(mode === "clips" ? 0 : 1)
        }

        system.get_dashboard_page_default().then(e => {
            setCurrentPage(e)
            console.log("Setting current page to", e)
            setInitialized(true)
        })
    }, [])

    const additionalElements = <ClipProcessingItems />
    return <Flex
        gap={4}
        flexDir='row'

        width='100%'
        height='100%'
    >
        <Flex
            w='15em'
            h='100%'
        >
            <NavBar data={data} />
        </Flex>
        <Flex
            flexDir='column'
            alignItems='center'
            w='100%'
            h='100%'
        >
            <Tabs
                w='100%'
                h='100%'
                isLazy
                display='flex'
                flexDir='column'
                isFitted
                index={currentPage}
                onChange={newIndex => setCurrentPage(newIndex)}
            >
                <TabList>
                    <Tab>Clips</Tab>
                    <Tab>Videos</Tab>
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
                        h='100%'
                        flexDir='column'
                        justifyContent='center'
                        alignItems='center'
                    >
                        <Clips additionalElements={additionalElements} />
                    </TabPanel>
                    <TabPanel
                        display='flex'
                        w='100%'
                        h='100%'
                        flexDir='column'
                        justifyContent='center'
                        alignItems='center'
                    >
                        <Videos additionalElements={additionalElements} />
                    </TabPanel>
                </TabPanels>

            </Tabs>
        </Flex>
    </Flex>
}