import { Flex } from '@chakra-ui/react'
import React from 'react'
import { useEffect, useRef, useState } from 'react'
import { RenderLogger } from 'src/interfaces/renderLogger'

const log = RenderLogger.get("obs", "clips", "preview")
export default function Preview() {
    const preview = useRef<HTMLDivElement>()
    const { obs } = window.api
    const [ displayId, setDisplayId ] = useState<string>(null)

    const resize = () => {
        if (!preview.current)
            return

        const { width, height, x, y } = preview.current.getBoundingClientRect()
        log.log("Resizing...", width, height, x, y)
        if(displayId)
            obs.resizePreview(displayId, { width, height, x, y })
    }
    useEffect(() => {
        if (!preview?.current)
            return


        const { width, height, x, y } = preview.current.getBoundingClientRect()
        obs.preview_init({ width, height, x, y })
            .then(({ displayId }) => setDisplayId(displayId))
    }, [preview])

    useEffect(() => {
        window.addEventListener("resize", () => {
            log.log("Resize event")
            resize()
        })
    }, [])

    useEffect(() => resize())

    useEffect(() => {
        if(!displayId)
            return () => {}

        return () => {
            log.log("Destroying id", displayId)
            obs.preview_destroy(displayId)
        }
    }, [ displayId])

    return <Flex
        className='previewContainer'
        ref={preview}
        style={{ height: "100%", width: "100%" }}
    />
}