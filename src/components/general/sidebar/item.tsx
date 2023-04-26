import { Flex } from '@chakra-ui/react';
import React, { PropsWithChildren } from 'react';
import { IconType } from 'react-icons';


export type SidebarItemProps = {
    svg: IconType,
    enabled?: boolean
}

export default function SidebarItem({ svg: Icon, enabled }: PropsWithChildren<SidebarItemProps>) {
    const grad = enabled ? "linear-gradient(to bottom right, #CA83E2 0%, #4E5DAD 100%);" : "linear-gradient(to bottom right, #000000 1.04%, #6C6C6C 1.05%, #323232 101.04%);"
    return <Flex
    background={grad}
    p='2'
    rounded='lg'
    >
        <Icon style={{
            height: "2rem",
            width: "2rem"
        }}></Icon>
    </Flex>
}