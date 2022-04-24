import { Clip } from '@backend/managers/clip/interface';
import { Flex, Grid, GridItem, Image, Text } from '@chakra-ui/react';
import React, { useEffect } from "react";
import { RenderLogger } from 'src/interfaces/renderLogger';
import Preview from './preview';

const log = RenderLogger.get("obs", "clips")
export default function Clips() {
    const [currClips, setClips] = React.useState<Clip[]>([])
    const { clips } = window.api

    useEffect(() => {
        clips.list()
            .then(e => setClips(e))
    }, [])

    const clipElements = currClips.map(({ thumbnail }, i) =>
        <GridItem key={`${i}-clipElements`}
            w='100%'
            h='100%'
            backgroundImage={thumbnail}
            backgroundSize='cover'
            backgroundPosition='center'
            borderRadius="xl"
        />
    )

    return <Grid
        justifyContent='start'
        alignItems='start'
        w='100%'
        h='100%'
        gap='1em'
        gridTemplateColumns='repeat(auto-fit, minmax(25em, 1fr))'
    >
        <Preview />
        {clipElements}
    </Grid>
}
