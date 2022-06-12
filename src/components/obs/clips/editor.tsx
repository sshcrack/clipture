import { Button } from '@chakra-ui/react'
import * as React from "react"

export default function Editor({ clipName, onBack }: { clipName: string, onBack: () => void }) {
    return <>
        <video controls autoPlay width='90%'>
            <source src={`clip-video-file:///${encodeURIComponent(clipName)}`}></source>
        </video>
        <Button onClick={onBack}>Back</Button>
    </>
}