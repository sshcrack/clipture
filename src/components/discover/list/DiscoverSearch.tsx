import { Button, Flex, Input } from '@chakra-ui/react';
import React, { useState, useContext } from "react";
import { useTranslation } from 'react-i18next';
import { DiscoverContext } from './DiscoverProvider';

export default function DiscoverSearch() {
    const [localSearch, setLocalSearch] = useState("")
    const { t } = useTranslation("discover", { keyPrefix: "search" })
    const { setSearch } = useContext(DiscoverContext)

    const search = () => {
        setSearch(localSearch)
    }

    return <Flex
        w='100%'
        h='100%'
        justifyContent='center'
        alignItems='center'
    >
        <Input
            w='50%'
            placeholder={t("placeholder")}
            borderBottomRightRadius='0'
            borderTopRightRadius='0'
            value={localSearch}
            onKeyUp={e => e.code === "Enter" && search()}
            onChange={e => setLocalSearch(e.target.value)}
        />
        <Button
            h='100%'
            borderBottomLeftRadius='0'
            borderTopLeftRadius='0'
            colorScheme='teal'
            variant='outline'
            onClick={() => search()}
        >
            {t("action")}
        </Button>
    </Flex>
}