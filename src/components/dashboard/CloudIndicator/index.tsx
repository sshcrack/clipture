import { SessionStatus } from '@backend/managers/auth/interfaces';
import { CloudUsage } from '@backend/managers/cloud/interface';
import { Flex, Progress, ProgressProps, Text } from '@chakra-ui/react';
import { IoCloud, IoCloudOfflineOutline } from "react-icons/io5"
import prettyBytes from 'pretty-bytes';
import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useSession } from 'src/componentsOld/hooks/useSession';
//import "src/componentsOld/titlebar/style.css";
import TitleBarItem from 'src/components/titlebar/TitleBarItem';
import "./progressColor.css";

export default function CloudIndicator() {
    const [usage, setUsage] = useState(undefined as CloudUsage)
    const { status } = useSession()
    const { cloud } = window.api
    const { t } = useTranslation("dashboard", { keyPrefix: "cloud_indicator" })

    useEffect(() => {
        if (status === SessionStatus.OFFLINE) {
            setUsage(null)
            return
        }

        cloud.usage()
            .then(e => setUsage(e))
            .catch(e => {
                console.error(e)
                setUsage(null)
            })

        return cloud.addUsageListener(e => setUsage(e))
    }, [status])


    const percentage = !usage ? 0 : usage.current / usage.maxTotal
    const progGeneral = {
        w: '50%',
        max: 1,
        rounded: 'md',
        className: 'progress-color',
    } as ProgressProps

    const prettierUsed = usage && prettyBytes(usage.current)
    const prettierTotal = usage && prettyBytes(usage.maxTotal)
    const content = <>
        <Progress
            value={percentage}
            h='1.1rem'
            style={{
                "--prog-color": "#ABB8FF"
            } as any}
            {...progGeneral}
        />
        <Flex pl='5' justifyContent='center' alignItems='center'>
            <IoCloud style={{
                color: "white",
                width: "calc(var(--titlebar-size) - 10px)",
                height: "calc(var(--titlebar-size) - 10px)"
            }} />
            <Text color='white' pl='2'>{prettierUsed} / {prettierTotal}</Text>
        </Flex>
    </>

    const placeholder = <>
        <Progress isAnimated hasStripe value={1} {...progGeneral} _first={{ rounded: "full"}} />
        <Text color='white' pl='2'> {t("loading")}</Text>
    </>

    console.log("Usage is", usage)
    return <TitleBarItem>
        <Flex w='100%' className='drag-titlebar' justifyContent='center' alignItems='center'>
            {usage === null ? <>
                <IoCloudOfflineOutline style={{
                    color: "white",
                    width: "calc(var(--titlebar-size) - 10px)",
                    height: "calc(var(--titlebar-size) - 10px)"
                }} />
                <Text color='white' pl='2'>{t("offline_mode")}</Text>
            </> : (usage ? content : placeholder)}
        </Flex>
    </TitleBarItem>
} 7