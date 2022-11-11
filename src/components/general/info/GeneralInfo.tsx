import { ClipCloudInfo } from '@backend/managers/clip/interface';
import { Badge, Flex, FlexProps, Image, Text } from '@chakra-ui/react';
import prettyMS from "pretty-ms";
import React from "react";
import { useTranslation } from 'react-i18next';

type Props = React.PropsWithChildren<FlexProps & {
    displayName?: string,
    imageSrc: string,
    gameName: string,
    modified: number,
    baseName: string,
    cloud: ClipCloudInfo
}>

export default function GeneralInfo({
    children, baseName, gameName,
    imageSrc, modified, cloud,
    displayName, ...props
}: Props) {
    const { t } = useTranslation("dashboard", { keyPrefix: "clips.general_info" })

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
        <Flex w='90%' alignItems='center' justifyContent='space-around'>
            <Text style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                textAlign: "center"
            }}>{displayName ?? baseName.replace(".mkv", "")}</Text>
            {cloud?.cloudOnly && <Badge colorScheme='green'>{t("cloud_only")}</Badge>}
        </Flex>
    </Flex>
}