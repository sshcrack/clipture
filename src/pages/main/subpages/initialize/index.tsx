import { Progress } from '@backend/processors/events/interface';
import { Flex, Text } from '@chakra-ui/react';
import * as React from "react";
import Page from 'src/components/general/page';
import ProgressBar from 'src/components/general/progress';

export function InitializePage({ progress }: { progress: Progress }) {
    const { percent, status } = progress
    return <Page
        alignItems='center'
        justifyContent='center'
        sidebar='disabled'
    >
        <Flex
            dir='column'
            gap='5'
            flexDir='column'
            alignItems='center'
            justifyContent='center'
            w='90%'
            h='100%'
        >
            <Text
                fontSize='4xl'
            >{status}</Text>
            <ProgressBar
                progress={percent}
                stroke
                w='100%'
                h='4rem'
            />
        </Flex>
    </Page >
}