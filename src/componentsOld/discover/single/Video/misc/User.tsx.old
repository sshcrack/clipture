import { BasicUser } from '@backend/managers/cloud/discover/interface';
import { Avatar, Flex, FlexProps, Text } from '@chakra-ui/react';
import { RenderGlobals } from '@Globals/renderGlobals';
import React from "react"

export default function ClipUser({ user, ...props }: { user: BasicUser } & Omit<FlexProps, "children">) {
    const { id, name } = user ?? {}
    return <Flex
        gap='5'
        justifyContent='center'
        alignItems='center'
        pr='5'
        {...props}
    >
        <Avatar size='sm' src={`${RenderGlobals.baseUrl}/api/user/image?id=${id}`} name={name ?? "Unknown User"} />
        <Text>{name}</Text>
    </Flex>
}