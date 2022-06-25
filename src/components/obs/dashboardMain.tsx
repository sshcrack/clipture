import { SessionData } from '@backend/managers/auth/interfaces';
import { ClipProcessingInfo } from '@backend/managers/clip/interface';
import { Flex, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { VideoGridItem } from '../general/grid/video';
import Clips from './clips';
import { NavBar } from './NavBar/';
import Videos from './videos';
import GradientLoader from './videos/gradientLoader';


//TODO: Add Illustration credits to settings
type ClipInfoArray = [string, ClipProcessingInfo]
export function DashboardMain({ data }: { data: SessionData }) {
    //const exampleArray = [[{ end: 10, start: 0, videoName: "Test.mkv" }, { percent: 0, status: "lol" }, 1]]
    const [clipsProg, setClipsProg] = useState<ClipInfoArray[]>([] /*exampleArray*/)
    const [update, setUpdate] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const [initialized, setInitialized] = useState(false)
    const { clips, system } = window.api

    useEffect(() => {
        if (!initialized)
            return

        console.log("Default page update to", currentPage)
        system.set_default_dashboard_page(currentPage)
    }, [currentPage])

    useEffect(() => {
        let shouldAbort = false
        clips.currently_cutting()
            .then(e => !shouldAbort && setClipsProg(e))

        return () => {
            shouldAbort = true
        }
    }, [update])

    useEffect(() => {
        system.get_dashboard_page_default().then(e => {
            setCurrentPage(e)
            console.log("Setting current page to", e)
            setInitialized(true)
        })

        clips.currently_cutting().then(e => setClipsProg(e))
        return clips.add_listener(() => setUpdate(Math.random()))
    }, [])


    const primaryColor = "var(--chakra-colors-brand-primary)"
    const secondaryColor = "var(--chakra-colors-brand-secondary)"
    const additionalElements = clipsProg.map(([_, { info, progress }], i) => {
        const { videoName } = info
        const textPercentage = Math.round(progress.percent * 1000) / 10
        return <VideoGridItem
            key={`${i}-clipProgress`}
            background='var(--chakra-colors-brand-bg)'
            boxShadow='inset 0px 0px 10px 0px var(--chakra-colors-brand-secondary)'
        >
            <motion.div
                style={{
                    display: "grid",
                    flex: 1,
                    width: "100%",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column"
                }}
                initial={{ transform: "scale(1)" }}
                animate={{ transform: "scale(1.1)" }}
                transition={{
                    delay: 0,
                    duration: 2.5,
                    repeat: Infinity,
                    repeatType: "mirror"
                }}
            >
                <Flex
                    w='15em'
                    h='15em'
                    gridRow='1'
                    gridColumn='1'
                >
                    <GradientLoader
                        percent={progress.percent}
                        size='15em'
                        gradient={[primaryColor, secondaryColor]}
                    />
                </Flex>
                <Flex
                    w='15em'
                    h='15em'
                    p='1em'
                    justifyContent='center'
                    alignItems='center'
                    gridRow='1'
                    gridColumn='1'
                    zIndex='10'
                    flexDir='column'
                >
                    <Text color={secondaryColor} fontSize='2em'>Cutting...</Text>
                    <Text color={secondaryColor} fontSize='2em'>{textPercentage.toFixed(1)}%</Text>
                </Flex>
            </motion.div>
            <Flex
                flex='0'
                gap='.25em'
                justifyContent='center'
                alignItems='center'
                flexDir='column'
                backdropFilter="blur(4px)"
                p='1'
            >
                <Text style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "90%",
                    textAlign: "center"
                }}>{videoName}</Text>
            </Flex>
        </VideoGridItem>
    })

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