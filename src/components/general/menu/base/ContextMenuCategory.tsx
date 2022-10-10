import { Flex, Text, TextProps } from "@chakra-ui/react";
import React from "react";

export const ContextMenuCategory = ({
    children,
    ...rest
}: React.PropsWithChildren<TextProps>) => {
    return <Flex
        justifyContent='center'
        alignItems='center'
        w='100%'
        pb='2'
        pt='2'
    >
        <Text
            {...rest}
        >{children}</Text>
    </Flex>

};
