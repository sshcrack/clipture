import { Flex, Box, Text, FlexProps } from '@chakra-ui/react';
import prettyMS from "pretty-ms"
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { EditorContext } from '../Editor';

export default function EditorTimelineTop(props: FlexProps) {
    const { selection } = useContext(EditorContext)
    const { t } = useTranslation("editor")
    const { end, start } = selection

    return <Flex w='80%' {...props}>
        <Text alignSelf='start' whiteSpace='nowrap'>{prettyMS(start * 1000)}</Text>
        <Box w='100%' />
        <Text alignSelf='end' whiteSpace='nowrap'>{!end || end === Infinity ? t("loading") : prettyMS(end * 1000)}</Text>
    </Flex>
}