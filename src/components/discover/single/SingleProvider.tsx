import { DiscoverClip } from '@backend/managers/cloud/interface'
import { Flex, useToast } from '@chakra-ui/react'
import React, { useState, useEffect } from "react"
import GeneralSpinner from 'src/components/general/spinner/GeneralSpinner'
import SingleItem from './SingleItem'

const CLIP_LIMIT = 20
export default function SingleDiscoverPage() {
    const [items, setItems] = useState(undefined as DiscoverClip[])
    const [currIndex, setCurrIndex] = useState(0)
    const [offset, setOffset] = useState(0)
    const [left, setLeft] = useState(Infinity)
    const [fetching, setFetching] = useState(false)

    const { discover } = window.api.cloud
    const toast = useToast()

    const fetchNextItems = () => {
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
    useEffect(() => {
        fetchNextItems()
    }, [])

    useEffect(() => {
        const listener = ({ key }: KeyboardEvent) => {
            if (!items)
                return

            if (key === "a") {
                const prevIndex = currIndex - 1
                const prom = Promise.resolve()
                if (prevIndex < 0)
                    return

                prom.then(() => setCurrIndex(prevIndex))
            }

            if (key === "d") {
                const nextIndex = currIndex + 1
                let prom = Promise.resolve()
                if (nextIndex >= items.length) {
                    if (left === 0)
                        return

                    prom = fetchNextItems()
                }

                prom.then(() => setCurrIndex(nextIndex))
            }
        }

        window.addEventListener("keyup", listener)

        return () => window.removeEventListener("keyup", listener)
    }, [items, currIndex])

    const curr = items && items[currIndex]
    return <Flex
        w='100%'
        h='100%'
        gap='5'
    >
        {fetching && <GeneralSpinner loadingText='Getting clip info...' />}
        {curr && !fetching ? <SingleItem item={curr} /> : <GeneralSpinner loadingText='Loading clips...' />}
    </Flex>
}