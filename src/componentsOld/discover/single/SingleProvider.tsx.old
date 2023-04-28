import { DiscoverClip } from '@backend/managers/cloud/interface'
import { useToast } from '@chakra-ui/react'
import React, { useEffect, useState } from "react"
import { useTranslation } from 'react-i18next'
import GeneralSpinner from 'src/componentsOld/general/spinner/GeneralSpinner'
import OuterNavigation from './navigation'
import SingleItem from './SingleItem'

const CLIP_LIMIT = 20
export default function SingleDiscoverPage() {
    const [items, setItems] = useState(undefined as DiscoverClip[])
    const [currIndex, setCurrIndex] = useState(0)
    const [offset, setOffset] = useState(0)
    const [left, setLeft] = useState(Infinity)
    const [fetching, setFetching] = useState(false)
    const { t } = useTranslation("discover", { keyPrefix: "single" })

    const { discover } = window.api.cloud
    const toast = useToast()

    useEffect(() => localStorage.setItem("discover-page-default", "single"), [])
    const fetchNextItems = async () => {
        if (fetching)
            return

        setFetching(true)
        return discover.list(offset, CLIP_LIMIT)
            .then(({ clips, leftOver }) => {
                if (clips.length === 0)
                    setCurrIndex(null)
                else
                    setCurrIndex(0)

                setLeft(leftOver)
                setItems(clips)
                setOffset(CLIP_LIMIT)
            })
            .catch(e => {
                console.error(e)
                toast({
                    status: "error",
                    description: e?.message ?? e?.stack ?? e
                })
            })
            .finally(() => setFetching(false))
    }

    useEffect(() => { fetchNextItems() }, [])
    const previousPage = async () => {
        const prevIndex = currIndex - 1
        if (prevIndex < 0)
            return

        setCurrIndex(prevIndex)
    }

    const nextPage = async () => {
        const nextIndex = currIndex + 1
        console.log("Next index", nextIndex, items.length)
        if (nextIndex >= items.length) {
            if (left === 0)
                return

            await fetchNextItems()
        }

        console.log("Setting next index to", nextIndex)
        setCurrIndex(nextIndex)
    }

    const curr = items && items[currIndex]
    const isLoaded = items && (typeof currIndex !== "undefined" || currIndex !== null)
    return <OuterNavigation
        hasNext={isLoaded && currIndex + 1 < items.length}
        hasPrevious={isLoaded && currIndex - 1 >= 0}
        nextPage={nextPage}
        previousPage={previousPage}
        p='5'
    >
        {fetching && <GeneralSpinner loadingText={t("loading")} />}
        {curr && !fetching ? <SingleItem item={curr} /> : <GeneralSpinner loadingText={t("loading")} />}
    </OuterNavigation>
}