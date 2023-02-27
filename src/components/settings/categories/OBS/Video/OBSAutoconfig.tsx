import { Progress } from '@backend/processors/events/interface'
import { Button, Flex, Progress as ProgressBar, Text } from '@chakra-ui/react'
import React, { useEffect, useState } from "react"
import { useTranslation } from 'react-i18next'

export default function OBSAutoConfig() {
    const [progress, setProgress] = useState(null as Progress)
    const { obs } = window.api
    const { t } = useTranslation("settings", { keyPrefix: "obs.video.auto_config" })

    useEffect(() => {
        return obs.onAutoConfigProgress(prog => {
            if (prog.percent === 1)
                return setProgress(null)

            setProgress(prog)
            console.log("Received prog update", prog)
        });
    }, [])

    return <>
        <Flex
            flexDir='column'
            w='70%'
        >
            {
                progress === null ?
                    <Button
                        colorScheme='green'
                        onClick={() => obs.startAutoConfig()}
                    >{t("automatic")}</Button> :
                    <Flex alignItems='center' justifyContent='center' flexDir='column'>
                        <Text>{progress.status}</Text>
                        <ProgressBar rounded='md' w='100%' colorScheme='yellow' size='md' value={progress.percent} max={1} />
                    </Flex>
            }
        </Flex>
    </>
}