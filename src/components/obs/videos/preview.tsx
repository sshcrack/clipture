import { Flex } from '@chakra-ui/react'
import React, { MutableRefObject, useEffect, useRef, useState } from 'react'
import { RenderLogger } from 'src/interfaces/renderLogger'

const log = RenderLogger.get("obs", "clips", "preview")
export default function Preview() {
    const preview = useRef<HTMLDivElement>()
    const { obs } = window.api
    const [displayId, setDisplayId] = useState<string>(null)

    useEffect(() => {
        if (!preview?.current || displayId)
            return

        const { width, height, x, y } = preview.current.getBoundingClientRect()
        obs.preview_init({ width, height, x, y })
            .then(({ displayId }) => {
                setDisplayId(displayId)
            })
    }, [preview])

    return <Flex
        className='previewContainer'
        ref={preview}
        style={{ height: "100%", width: "100%", background: "red" }}>
            {displayId && preview.current && <InnerPreview displayId={displayId} preview={preview} />}
    </Flex>
}

function InnerPreview({ displayId, preview }: { displayId: string, preview: MutableRefObject<HTMLDivElement> }) {
    const { obs } = window.api

    const resize = () => {
        if (!preview.current)
            return

        const { width, height, x, y } = preview.current.getBoundingClientRect()
        if (displayId) {
            obs.resizePreview(displayId, { width, height, x, y })
        }
    }

    useEffect(() => resize())
    useEffect(() => {
        if (!displayId)
            return () => { }

        return () => {
            log.log("Destroying id", displayId)
            obs.preview_destroy(displayId)
        }
    }, [displayId])

    useEffect(() => {
        window.addEventListener("resize", () => {
            log.log("Resize event")
            resize()
        })
    }, [])

    return <></>
}