import { Flex, Box, Text } from '@chakra-ui/react';
import prettyMS from "pretty-ms"
import React, { useContext } from 'react';
import { EditorContext } from '../Editor';

export default function EditorTimelineTop() {
    const { selection } = useContext(EditorContext)
    const { end, start } = selection

    console.log("Timeline Rerender")
    return <Flex w='80%'>
        <Text alignSelf='start' whiteSpace='nowrap'>{prettyMS(start * 1000)}</Text>
        <Box w='100%' />
        <Text alignSelf='end' whiteSpace='nowrap'>{end === undefined ? "Loading..." : prettyMS(end * 1000)}</Text>
    </Flex>
}