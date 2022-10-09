import { Flex, useToast } from '@chakra-ui/react'
import { scaleKeepRatioSpecific } from '@general/tools'
import React, { MutableRefObject, useEffect, useRef, useState } from 'react'
import GeneralSpinner from 'src/components/general/spinner/GeneralSpinner'
import { RenderLogger } from 'src/interfaces/renderLogger'

type Dimension = { width: number, height: number }

const log = RenderLogger.get("obs", "clips", "preview")
export default function Preview() {
    const preview = useRef<HTMLDivElement>()
    const [size, setSize] = useState<Dimension>(null)

    const { obs } = window.api
    const toast = useToast()

    useEffect(() => {
        obs.previewSize()
            .then(e => setSize(e))
            .catch(e => {
                log.error(e)
                toast({
                    title: e?.message ?? "Error",
                    description: e?.stack ?? e
                })
            })
    }, [])


    const canShowPreview = preview.current && size
    return <Flex
        className='previewContainer'
        w='100%'
        h='100%'
        justifyContent='center'
        alignItems='center'
        ref={preview}
    >
        {canShowPreview ? <InnerPreview preview={preview} size={size} />
            : <GeneralSpinner loadingText='Getting record size...' />}
    </Flex>
}

function InnerPreview({ preview, size }: { preview: MutableRefObject<HTMLDivElement>, size: Dimension }) {
    const { obs } = window.api
    const { height: aspectHeight, width: aspectWidth } = size

    const [displayId, setDisplayId] = useState<string>(null)
    const actualPreviewCenter = useRef<HTMLDivElement>(null)

    const getCoordinates = () => {
        if (!preview.current)
            return

        const { width, height, x, y } = preview.current.getBoundingClientRect()
        console.log("ah:", aspectHeight, "aw:", aspectWidth, "w:", width, "h:", height)
        const [resizeW, resizeH] = scaleKeepRatioSpecific(aspectWidth, aspectHeight, { width, height }, true)
        console.log("Resized", resizeW, resizeH)

        const diffW = width - resizeW
        const diffH = height - resizeH

        const centerX = Math.floor(x + diffW / 2)
        const centerY = Math.floor(y + diffH / 2)

        return {
            x: centerX,
            y: centerY,
            width: resizeW,
            height: resizeH
        }
    }

    const updatePreview = () => {
        if (!preview.current || !displayId)
            return

        log.silly("Updating preview with displayId", displayId, "...")
        const coordinates = getCoordinates()
        return obs.resizePreview(displayId, coordinates)
    }


    useEffect(() => {
        const handler = () => {
            updatePreview()
            console.log("Resize handler")
        }

        window.addEventListener("resize", handler)
        window.addEventListener("scroll", handler)
        return () => {
            window.removeEventListener("resize", handler)
            window.removeEventListener("scroll", handler)
        }
    }, [preview, displayId])
    useEffect(() => {
        if (!displayId || !preview.current)
            return

        updatePreview()
    })

    useEffect(() => {
        if (!displayId)
            return () => { }

        return () => {
            log.silly("Destroying id", displayId)
            obs.previewDestroy(displayId)
        }
    }, [displayId])

    useEffect(() => {
        if (!preview.current || displayId)
            return

        const coordinates = getCoordinates()
        log.silly("Initializing preview with coordinates", coordinates)
        obs.previewInit(coordinates)
            .then(e => {
                log.silly("Preview created", e)
                setDisplayId(e.displayId)
            })
    }, [preview, displayId])

    return <Flex ref={actualPreviewCenter} />
}