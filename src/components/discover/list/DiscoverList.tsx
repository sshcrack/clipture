import { DiscoverClip } from '@backend/managers/cloud/interface';
import React, { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from 'react-infinite-scroller';
import { VideoGridContext } from '../../general/grid/video';
import "../../general/grid/video.css";
import GeneralSpinner from '../../general/spinner/GeneralSpinner';
import DiscoverItem from './DiscoverItem';


const CLIP_LIMIT = 20
export default function DiscoverList() {
    const [items, setItems] = useState([] as DiscoverClip[]);
    const [fetching, setFetching] = useState(false)
    const [leftClips, setLeftClips] = useState(undefined)
    const { cloud } = window.api

    const infiniteScrollRef = useRef<InfiniteScroll>(null)
    const [gridRef, setGridRef] = useState({ current: null })
    const [cachedDurations, setCachedDurations] = useState(new Map<string, number>())

    const fetchClips = (offset: number) => cloud.discover.list(offset, CLIP_LIMIT)

    useEffect(() => {
        if (!infiniteScrollRef?.current)
            return

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore it exists trust me, ts-script
        setGridRef({ current: infiniteScrollRef.current.scrollComponent })
    }, [infiniteScrollRef])

    useEffect(() => {
        fetchClips(0)
            .then(e => {
                setItems(e.clips)
                setLeftClips(e.leftOver)
                console.log("Setting items", e)
            })
    }, [])

    const fetchItems = useCallback(
        async () => {
            if (fetching) {
                return;
            }

            setFetching(true);

            try {
                const e = await fetchClips(items.length);

                setLeftClips(e.leftOver)
                setItems([...items, ...e.clips]);
            } finally {
                setFetching(false);
            }
        },
        [items, fetching]
    );

    console.log("Left", leftClips, "items", items)
    return !items ? <GeneralSpinner loadingText='Loading clips...' /> :
        <VideoGridContext.Provider value={{ cachedDurations, gridRef, setCachedDurations }}>
            <InfiniteScroll
                loadMore={fetchItems}
                hasMore={typeof leftClips !== "undefined" ? leftClips !== 0 : true}
                ref={infiniteScrollRef}
                loader={<GeneralSpinner loadingText='loading...' />}
                className='videoGrid'
                style={{
                    display: "grid",
                    justifyContent: 'start',
                    alignItems: 'start',
                    width: '100%',
                    gap: '1em',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(21.5em,1fr))',
                    overflowY: 'auto',
                    padding: '5',
                    paddingRight: '2',
                    marginRight: '4'
                }}
            >
                {items.map(item => <DiscoverItem key={`discover-${item.id}`} item={item} />)}
            </InfiniteScroll>
        </VideoGridContext.Provider >
}