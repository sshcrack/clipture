import { SessionData } from '@backend/managers/auth/interfaces';
import { Button, Flex } from '@chakra-ui/react';
import React from "react";
import { useTranslation } from 'react-i18next';
import DiscoverList from 'src/components/discover/list/DiscoverList';
import SingleDiscoverPage from 'src/components/discover/single/SingleProvider';
import NavBar from 'src/components/general/NavBar';

export type DiscoverDisplayType = "single" | "list"

export default function DiscoverPage({ data, type }: { data: SessionData, type?: DiscoverDisplayType }) {
    const { t } = useTranslation("discover", { keyPrefix: "button" })
    if (!type)
        type = localStorage.getItem("discover-page-default") === "list" ? "list" : "single"

    const oppositeType = type === "list" ? "single" : "list"
    return <Flex h='100%' w='100%' gap='4'>
        <NavBar
            data={data}
            w='5em'
            h='100%'
        />
        <Flex
            w='100%'
            h='100%'
            justifyContent='center'
            alignItems='start'
            flexDir='column'
        >
            <Button onClick={() => {
                localStorage.setItem("discover-page-default", oppositeType)
                location.hash = `#/discover/${oppositeType}`
            }}>{t(oppositeType)}</Button>
            <Flex
                w='100%'
                h='100%'
                p='5'
                justifyContent='center'
                alignItems='center'
            >
                {type === "list" ? <DiscoverList /> : <SingleDiscoverPage />}
            </Flex>
        </Flex>
    </Flex>
}