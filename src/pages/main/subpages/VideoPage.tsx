import React from "react"
import ClipProcessingItems from 'src/components/obs/progress/ClipProgressItems';
import Videos from 'src/components/obs/videos';

export default function VideoPage() {
    return <Videos additionalElements={<ClipProcessingItems />} />
}