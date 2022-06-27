import { Flex, IconButton, Tooltip } from '@chakra-ui/react'
import React, { useContext, useState } from "react"
import { BsArrowClockwise } from 'react-icons/bs'
import { FaPlay } from 'react-icons/fa'
import { EditorContext } from '../Editor'
export default function EditorBarButtons() {
    return <Flex
        flexDir='column'
        h='100%'
        alignItems='center'
        justifyContent='center'
        w='3em'
        pr='2'
    >
        <Tooltip label='Play Clip'>
            <IconButton
                h='100%'
                w='100%'
                aria-label='play-clip'
                icon={<FaPlay />}
                colorScheme='green'
                borderBottomLeftRadius='0'
                borderBottomRightRadius='0'
            />
        </Tooltip>
        <Tooltip label='Reset'>
            <IconButton
                borderTopLeftRadius='0'
                borderTopRightRadius='0'
                h='100%'
                w='100%'
                colorScheme='red'
                variant='solid'
                aria-label='reset-selection'
                icon={<BsArrowClockwise />}
            />
        </Tooltip>
    </Flex>
}