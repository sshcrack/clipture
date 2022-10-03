import { Flex, Heading } from "@chakra-ui/react"
import React, { useEffect, useRef, useState } from "react"
import GeneralSpinner from "src/components/general/spinner/GeneralSpinner"
import { ReactSetState } from 'src/types/reactUtils'

export type Selection = {
    start: number,
    end: number,
    offset: number,
    range: number
}
export type EditorState = {
    videoName: string,
    onBack: () => unknown,
    duration: number,
    setDuration: ReactSetState<number>
    selection: Selection,
    setSelection: ReactSetState<Selection>,
    videoRef?: React.MutableRefObject<HTMLVideoElement>,
    bgGeneratorRef?: React.MutableRefObject<HTMLVideoElement>,
    paused: boolean,
    setPaused: ReactSetState<boolean>,
    bookmarks: number[]
}

export const EditorContext = React.createContext<EditorState>({
    videoName: null as string,
    duration: undefined,
    setDuration: () => { },
    onBack: (() => { }) as () => unknown,
    selection: {
        end: undefined,
        offset: 0,
        start: 0,
        range: undefined
    },
    setSelection: () => { },
    videoRef: undefined,
    paused: true,
    setPaused: () => { },
    bookmarks: []
})

type Props = {
    videoName: string,
    onBack: () => unknown
}

export default function Editor({ children, videoName, onBack }: React.PropsWithChildren<Props>) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const bgGeneratorRef = useRef<HTMLVideoElement>(null);
    const [paused, setPaused] = useState(true)
    const [duration, setDuration] = useState<number>(undefined)
    const [bookmarks, setBookmarks] = useState<number[]>(undefined)
    const [loaded, setLoaded] = useState(false)
    const [selection, setSelection] = useState<Selection>({
        end: 0,
        offset: 0,
        start: 0,
        range: 0
    })

    const { videos } = window.api
    useEffect(() => {
        videos.list()
            .then(e => {
                console.log("Vid", e)
                const vid = e.find(x => x.videoName === videoName)

                setBookmarks(vid?.bookmarks ?? [])
            })
            .finally(() => setLoaded(true))
    }, [])

    if (!loaded)
        return <Flex>
            <GeneralSpinner loadingText='Getting video info...' />
        </Flex>

    console.log(bookmarks)
    if (!bookmarks) {
        return <Flex
            flexDir='column'
            justifyContent='center'
            alignItems='center'
        >
            <Heading>Video information could not be loaded.</Heading>
            <Heading size='sm'>This video seems to be deleted.</Heading>
        </Flex>
    }

    return <EditorContext.Provider
        value={{
            videoName,
            onBack,
            selection,
            setSelection,
            videoRef,
            paused,
            setPaused,
            duration,
            setDuration,
            bgGeneratorRef,
            bookmarks
        }}
    >
        {children}
    </EditorContext.Provider>

}