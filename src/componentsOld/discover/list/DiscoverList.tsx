import React, { useCallback, useContext, useEffect, useState, useRef } from "react";
import InfiniteScroll from 'react-infinite-scroller';
import { VideoGridContext } from '../../general/grid/video';
import "../../general/grid/video.css";
import GeneralSpinner from '../../general/spinner/GeneralSpinner';
import DiscoverItem from './DiscoverItem';
import { DiscoverContext } from './DiscoverProvider';


const CLIP_LIMIT = 20
export default function DiscoverList() {
    const { search, items, setItems } = useContext(DiscoverContext)
    const [fetching, setFetching] = useState(false)
    const [leftClips, setLeftClips] = useState(undefined)
    const { cloud } = window.api

    const testRef = useRef<InfiniteScroll>()
    const [gridRef, setGridRef] = useState({ current: null })
    const [cachedDurations, setCachedDurations] = useState(new Map<string, number>())

    useEffect(() => localStorage.setItem("discover-page-default", "list"), [])
    const fetchClips = (offset: number, search?: string) => cloud.discover.list(offset, CLIP_LIMIT, search)

    useEffect(() => {
        console.log("Fetching clips with", search)
        fetchClips(0, search)
            .then(e => {
                setItems(e.clips)
                setLeftClips(e.leftOver)
                console.log("Setting items", e)
            })
    }, [search])

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

    const comp = items && <InfiniteScroll
        loadMore={fetchItems}
        hasMore={typeof leftClips !== "undefined" ? leftClips !== 0 : true}
        loader={<GeneralSpinner loadingText='loading...' />}
        className='videoGrid'
        ref={testRef}
        style={{
            display: "grid",
            justifyContent: 'start',
            alignItems: 'start',
            width: '100%',
            height: '100%',
            gap: '1em',
            gridTemplateColumns: 'repeat(auto-fill, minmax(21.5em,1fr))',
            overflowY: 'auto',
            padding: '5',
            paddingRight: '2',
            marginRight: '4',
            alignSelf: 'start',
            justifySelf: 'start'
        }}
    >
        {items.map(item => <DiscoverItem key={`discover-${item.id}`} item={item} />)}
    </InfiniteScroll>


    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore it exists trust me, ts-script
    const currRef = comp?.ref
    useEffect(() => {
        if (!currRef?.current)
            return

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore it exists trust me, ts-script
        setGridRef({ current: currRef.current.scrollComponent })
    }, [currRef])


    return !items ? <GeneralSpinner loadingText='Loading clips...' /> :
        <VideoGridContext.Provider value={{ cachedDurations, gridRef, setCachedDurations }}>
            {comp}
        </VideoGridContext.Provider >
}