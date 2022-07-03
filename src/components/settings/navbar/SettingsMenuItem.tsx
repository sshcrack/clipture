import { Button } from '@chakra-ui/react';
import React from "react";
import { useParams } from 'react-router-dom';

export type SettingsMenuItemProps = {
    label: string,
    defaultItem?: boolean
}

export default function SettingsMenuItem({ label, defaultItem }: SettingsMenuItemProps) {
    const { item } = useParams()
    const active = item === label.toLowerCase() || (defaultItem && !item)

    return <Button
        onClick={() => location.hash = `/settings/${label.toLowerCase()}`}
        rounded='xl'
        colorScheme='brandSecondary'
        variant={active ? "solid" : "ghost"}
    >{label}</Button>
}