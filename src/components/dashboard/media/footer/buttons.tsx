import { GeneralMediaInfo } from '@backend/managers/clip/new_interfaces';
import { Box, Flex, IconButton } from '@chakra-ui/react';
import React from "react"
import { AiFillFolderOpen } from 'react-icons/ai';
import { FiUpload } from "react-icons/fi"
import { MdDelete } from 'react-icons/md';

export default function FooterButtons({ media }: { media: GeneralMediaInfo }) {
    return <Flex alignItems='center' gap='4'>
        <Box
            aria-label='Open Folder'
            size='1.75rem'
            color='dashboard.buttons.open_folder'
            as={AiFillFolderOpen}
        />
        <Box
            aria-label='Upload'
            size='1.75rem'
            color='dashboard.buttons.upload'
            as={FiUpload}
        />
        <Box
            aria-label='Delete'
            color='dashboard.buttons.delete'
            size='1.75rem'
            p='1'
            _hover={{
                border: '1px solid red',
                borderRadius: '2em'
            }}
            as={MdDelete}
        />
    </Flex>
}