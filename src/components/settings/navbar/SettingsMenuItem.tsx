import { Button } from '@chakra-ui/react';
import React, { useContext } from "react";
import { useParams } from 'react-router-dom';
import { SettingsSaveContext } from 'src/pages/main/subpages/settings/SettingsSaveProvider';
import { SettingsMenuCategoryContext } from './SettingsMenuCategory';

export type SettingsMenuItemProps = {
    label: string,
    link: string,
    defaultItem?: boolean
}

export default function SettingsMenuItem({ label, link, defaultItem }: SettingsMenuItemProps) {
    const { item } = useParams()
    const { category } = useContext(SettingsMenuCategoryContext)
    const { modified, onShake } = useContext(SettingsSaveContext)


    const hashLink = `${category.toLowerCase()}-${link.toLowerCase()}`
    const active = item === hashLink || (defaultItem && !item)

    const onClick = () => {
        if (!modified)
            return location.hash = `/settings/${hashLink}`

        onShake()
    }

    return <Button
        onClick={() => onClick()}
        rounded='xl'
        colorScheme='brandSecondary'
        variant={active ? "solid" : "link"}
        style={{ height: "var(--chakra-sizes-10)" }}
        justifyContent='left'
        paddingInline='4'
    >{label}</Button>
}