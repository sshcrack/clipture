import React, { useRef, useState } from "react"
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
    setPaused: ReactSetState<boolean>
}

export const EditorContext = React.createContext<EditorState>({
    videoName: null as string,
    duration: undefined,
    setDuration: () => {},
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
    setPaused: () => {}
})

type Props = {
    videoName: string,
    onBack: () => unknown
}

export default function Editor({ children, videoName, onBack }: React.PropsWithChildren<Props>) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const bgGeneratorRef = useRef<HTMLVideoElement>(null);
    const [ paused, setPaused ] = useState(true)
    const [ duration, setDuration ] = useState<number>(undefined)
    const [selection, setSelection] = useState<Selection>({
        end: 0,
        offset: 0,
        start: 0,
        range: 0
    })

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
            bgGeneratorRef
        }}
    >
        {children}
    </EditorContext.Provider>

}