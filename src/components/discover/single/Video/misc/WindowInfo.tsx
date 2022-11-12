import { CloudWindowInfo } from '@backend/managers/cloud/interface';
import { Flex, Text } from '@chakra-ui/react';
import React from "react";

type Props = {
    info: CloudWindowInfo,
    imgSize?: string,
    fontSize?: string
}

export default function WindowInfo({ info, fontSize, imgSize }: Props) {
    const { title, icon } = info

    return <Flex
        p='3'
        justifyContent='center'
        alignItems='center'
        borderBottomRightRadius='md'
        gap='3'
    >
        <img
            src={`/api/clip/icon/${icon}`}
            alt='Game Image'
            style={{
                width: imgSize ?? "1.5rem",
                height: imgSize ?? "1.5rem",
                borderRadius: "var(--chakra-radii-md)"
            }}
        />
        <Text fontSize={fontSize} whiteSpace='nowrap'>{title}</Text>
    </Flex>
}