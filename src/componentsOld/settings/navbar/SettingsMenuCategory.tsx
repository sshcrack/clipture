import { Flex, Heading } from '@chakra-ui/react';
import React from 'react';

type SettingsMenuCategoryState = {
    category: string
}

export const SettingsMenuCategoryContext = React.createContext<SettingsMenuCategoryState>({
    category: "null"
})

export default function SettingsMenuCategory({ children, category, link }: React.PropsWithChildren<{ category: string, link: string }>) {
    return <SettingsMenuCategoryContext.Provider
        value={{ category: link }}
    >
        <Flex
            pt='4'
        >
            <Heading
                alignSelf='center'
                textTransform='uppercase'
                size='md'
            >{category}</Heading>
        </Flex>
        {children}
    </SettingsMenuCategoryContext.Provider>
}