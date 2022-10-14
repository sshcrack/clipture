import { Flex, FlexProps, Image, Text } from '@chakra-ui/react';
import { getIcoUrl } from '@general/tools';
import prettyMS from "pretty-ms";
import React from "react";

type Props = React.PropsWithChildren<FlexProps & {
    icoName: string,
    imageSrc: string,
    gameName: string,
    modified: number,
    baseName: string
}>

export default function GeneralInfo({
    children, baseName, gameName,
    icoName, imageSrc, modified,
    ...props
}: Props) {
    return <Flex
        gap='.25em'
        justifyContent='center'
        alignItems='center'
        p='1'
        flexDir='column'
        flex='1'
        {...props}
    >
        <Flex gap='1em' justifyContent='center' alignItems='center' w='70%'>
            <Image borderRadius='20%' src={icoName ? getIcoUrl(icoName) : imageSrc} w="1.5em" />
            <Text textOverflow='ellipsis' whiteSpace='nowrap'>{gameName}</Text>
            <Text ml='auto'>{prettyMS(Date.now() - modified, { compact: true })}</Text>
            {children}
        </Flex>
        <Text style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "90%",
            textAlign: "center"
        }}>{baseName}</Text>
    </Flex>
}