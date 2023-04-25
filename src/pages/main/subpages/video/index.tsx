import React from "react"
import ClipProcessingItems from 'src/componentsOld/obs/progress/ClipProgressItems';
import Videos from 'src/componentsOld/obs/videos';

export default function VideoPage() {
    return <Videos additionalElements={ClipProcessingItems()} />
}