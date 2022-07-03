import { Button } from '@chakra-ui/react';
import React, { useContext } from "react";
import { useParams } from 'react-router-dom';
import { SettingsMenuCategoryContext } from './SettingsMenuCategory';

export type SettingsMenuItemProps = {
    label: string,
    defaultItem?: boolean
}

export default function SettingsMenuItem({ label, defaultItem }: SettingsMenuItemProps) {
    const { item } = useParams()
    const { category } = useContext(SettingsMenuCategoryContext)

    const hashLink = `${category.toLowerCase()}-${label.toLowerCase()}`
    const active = item === hashLink || (defaultItem && !item)

    return <Button
        onClick={() => location.hash = `/settings/${hashLink}`}
        rounded='xl'
        colorScheme='brandSecondary'
        variant={active ? "solid" : "link"}
        style={{ height: "var(--chakra-sizes-10)" }}
        justifyContent='left'
        paddingInline='4'
    >{label}</Button>
}