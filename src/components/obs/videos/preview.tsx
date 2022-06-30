import { Flex } from '@chakra-ui/react'
import { scaleKeepRatioSpecific } from '@general/tools'
import React, { MutableRefObject, useEffect, useRef, useState } from 'react'
import { RenderLogger } from 'src/interfaces/renderLogger'

const log = RenderLogger.get("obs", "clips", "preview")
export default function Preview() {
    const preview = useRef<HTMLDivElement>()
    const { obs } = window.api
    const [displayId, setDisplayId] = useState<string>(null)
    const [previewWidth, setPreviewWidth] = useState(16)
    const [previewHeight, setPreviewHeight] = useState(9)

    useEffect(() => {
        if (!preview?.current || displayId)
            return

        const { width, height, x, y } = preview.current.getBoundingClientRect()
        obs.preview_init({ width, height, x, y })
            .then(({ displayId, sceneSize }) => {
                const { height, width } = sceneSize

                setDisplayId(displayId)
                setPreviewHeight(height)
                setPreviewWidth(width)
            })
    }, [preview])

    return <Flex
        className='previewContainer'
        w='100%'
        h='100%'
        justifyContent='center'
        alignItems='center'
        ref={preview}>
        {displayId && preview.current && <InnerPreview displayId={displayId} preview={preview} previewHeight={previewHeight} previewWidth={previewWidth} />}
    </Flex>
}

function InnerPreview({ displayId, preview, previewHeight, previewWidth }: { displayId: string, preview: MutableRefObject<HTMLDivElement>, previewWidth: number, previewHeight: number }) {
    const { obs } = window.api
    const actualPreviewCenter = useRef<HTMLDivElement>(null)

    const resize = () => {
        if (!preview.current || !actualPreviewCenter.current)
            return
        const b = actualPreviewCenter.current

        const { width, height } = preview.current.getBoundingClientRect()
        const [resizeW, resizeH] = scaleKeepRatioSpecific(previewWidth, previewHeight, { width, height }, true)
        b.style.width = resizeW + "px"
        b.style.height = resizeH + "px"

        const { x, y } = b.getBoundingClientRect()
        if (displayId) {
            obs.resizePreview(displayId, { width: resizeW, height: resizeH, x, y })
        }
    }

    useEffect(() => resize())
    useEffect(() => {
        if (!displayId)
            return () => { }

        return () => {
            log.silly("Destroying id", displayId)
            obs.preview_destroy(displayId)
        }
    }, [displayId])

    useEffect(() => {
        const handler = () => {
            resize()
        }

        window.addEventListener("resize", handler)
        return () => window.removeEventListener("resize", handler)
    }, [])

    return <Flex ref={actualPreviewCenter} />
}