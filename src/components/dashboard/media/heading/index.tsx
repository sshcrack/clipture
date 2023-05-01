import { RenderGlobals } from '@Globals/renderGlobals';
import { GeneralMediaInfo, MediaStatus } from '@backend/managers/clip/new_interfaces';
import { Box, Circle, Flex, Grid, Image, Text } from '@chakra-ui/react';
import { getGameInfo } from '@general/tools/game';
import React from "react"
import { MdModeEditOutline } from "react-icons/md"
import { FaCut } from 'react-icons/fa';


function statusToColor(status: MediaStatus) {
    if (status === MediaStatus.Cutting)
        return "dashboard.item.cutting"

    if (status === MediaStatus.Uploaded)
        return "dashboard.item.uploaded"

    if (status === MediaStatus.Video)
        return "dashboard.item.video"

    return "dashboard.item.local"
}

export default function MediaHeading({ media }: { media: GeneralMediaInfo }) {
    const { mediaName, status, game } = media.info
    const statusColor = statusToColor(status)

    const { gameName, icon, id } = getGameInfo(game, mediaName)
    const gameImg = id ? `${RenderGlobals.baseUrl}/api/game/image?id=${id ?? "null"}&icon=${icon ?? "null"}` : icon



    return <Grid
        flexDir='column'
        gap='2'
        templateColumns='1.5rem minmax(1em, 100%)'
        justifyContent='start'
        alignItems='center'
    >
        <Flex justifyContent='center' alignItems='center'>
            <Circle size='6px' bg={statusColor} />
        </Flex>
        <Flex
            pr='2'
            gap='2'
            alignItems='center'
        >
            <Text
                whiteSpace='nowrap'
                fontSize='lg'
                textOverflow='ellipsis'
                overflow='hidden'
            >{mediaName}</Text>
            <Box as={MdModeEditOutline} h='1rem' w='1rem' color='dashboard.item.edit_pen'/>
        </Flex>
        {status !== MediaStatus.Cutting ?
            <>
                <Image w='1.5rem' h='1.5rem' rounded='lg' src={gameImg} />
                <Text
                    whiteSpace='nowrap'
                    fontSize='md'
                    textOverflow='ellipsis'
                    overflow='hidden'
                >{gameName}</Text>
            </> :
            <>
                <Flex />
                <Flex alignItems='center' gap='4'>
                    <Box as={FaCut} w='1.5rem' h='1.5rem' />
                    <Text fontSize='lg'>Cutting...</Text>
                </Flex>
            </>
        }
    </Grid>
}