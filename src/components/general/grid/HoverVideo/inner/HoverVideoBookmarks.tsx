import { Flex, Text } from '@chakra-ui/react';
import { MdPlace } from 'react-icons/md';
import React from "react"

type HoverVideoBookmarksProps = {
    bookmarks: number[]
}

export default function HoverVideoBookmarks({ bookmarks }: HoverVideoBookmarksProps) {
    return <Flex
        bg='rgba(0,0,0,0.75)'
        borderTopRightRadius='xl'
        justifyContent='center'
        alignItems='center'
        gap='2'
        p='2'
    >
        <MdPlace style={{ height: "1.5rem", width: "100%" }} />
        <Text>{bookmarks?.length}</Text>
    </Flex>
}