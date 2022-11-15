import { Flex, Text, TextProps, Tooltip } from "@chakra-ui/react";
import React, { createContext } from "react";

export type ContextMenuCategoryProps = {
    name: string,
    disabled?: boolean,
    tooltip?: string
} & TextProps

export type ContextMenuCategoryState = {
    disabled: boolean
}

export const ContextMenuCategoryContext = createContext<ContextMenuCategoryState>({
    disabled: false
})

export const ContextMenuCategory = ({
    children,
    name,
    disabled,
    tooltip,
    ...rest
}: ContextMenuCategoryProps) => {
    return <ContextMenuCategoryContext.Provider
        value={{ disabled }}
    >
        <Flex
            justifyContent='center'
            alignItems='center'
            w='100%'
            pb='2'
            pt='2'
        >
            <Text
                {...rest}
            >{name}</Text>
        </Flex>
        {tooltip ? <Tooltip shouldWrapChildren label={tooltip}>
            {children}
        </Tooltip> : children}
    </ContextMenuCategoryContext.Provider>

};
