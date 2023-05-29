import { SessionInfo } from '@backend/managers/auth/interfaces';
import { Flex, Text } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Page from '@components/general/page';
import TabList from '@components/general/tabList';
import Tab from '@components/general/tabList/tab';
import CloudIndicator from '@components/dashboard/CloudIndicator';
import "@pages/main/subpages/dashboard/index.css";
import { sitesToIndex, strToId } from './tools';
import { Globals, MediaCategories } from '@Globals/index';
import MediaOverview from '@components/dashboard/media/overview';


//TODO: Add Illustration credits to settings
export default function DashboardPage({ info }: { info: SessionInfo }) {
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
            return setCurrentPage(sitesToIndex(MediaCategories, mode))

        system.get_dashboard_page_default().then(e => {
            setCurrentPage(e)
            setInitialized(true)
        })
    }, [])


    return <Page
        sidebar='dashboard'
        noPadding
    >
        <CloudIndicator />
        <Flex className='title' p='6' pl='8'>
            <Text fontSize='2xl'>Recorded clips</Text>
        </Flex>
        <TabList pl='20' index={currentPage}>
            {MediaCategories.map((e, newIndex) => {
                return <Tab
                    key={`tab-${e}`}
                    onClick={() => {
                        setCurrentPage(newIndex)

                        const siteName = strToId(e)
                        history.pushState(null, null, `#/${siteName}`);
                    }}
                >
                    {t(`sites.${e}` as any)}
                </Tab>
            })}
        </TabList>
        <Flex className='content' w='100%' h='100%' p='6' pl='8' overflow='auto'>
            <MediaOverview category={MediaCategories[currentPage]}/>
        </Flex>
    </Page>
}