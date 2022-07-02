import { Text } from '@chakra-ui/react';
import React from 'react';

export default function SettingsMenuCategory({ children }: React.PropsWithChildren) {
    return <Text alignSelf='center'>{children}</Text>
}