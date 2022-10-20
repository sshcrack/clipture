import { Flex, FlexProps, Image, Text } from '@chakra-ui/react';
import prettyMS from "pretty-ms";
import React from "react";

type Props = React.PropsWithChildren<FlexProps & {
    displayName?: string,
    imageSrc: string,
    gameName: string,
    modified: number,
    baseName: string
}>

export default function GeneralInfo({
    children, baseName, gameName,
    imageSrc, modified,
    displayName, ...props
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
            <Image borderRadius='20%' src={imageSrc} w="1.5em" />
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
        }}>{displayName ?? baseName.replace(".mkv", "")}</Text>
    </Flex>
}