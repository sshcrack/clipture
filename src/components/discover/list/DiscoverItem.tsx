import { DiscoverClip } from '@backend/managers/cloud/interface';
import { getGameInfo } from '@general/tools/game';
import { RenderGlobals } from '@Globals/renderGlobals';
import React, { useState } from "react";
import HoverVideoWrapper from '../../general/grid/HoverVideo/HoverVideoWrapper';
import { VideoGridItem } from '../../general/grid/video';
import GeneralInfo from '../../general/info/GeneralInfo';
import GeneralInfoProvider from '../../general/info/GeneralInfoProvider';

export type DiscoverItemProps = {
    item: DiscoverClip
}

export default function DiscoverItem({ item }: DiscoverItemProps) {
    const { id, title, game, uploadDate, windowInfo } = item

    const icoName = windowInfo?.icon
    const [update, setUpdate] = useState(0)
    const { gameName, icon: gameIcon, id: gameId } = getGameInfo(game, null)
    const imageSrc = icoName ? `${RenderGlobals.baseUrl}/api/clip/icon/${icoName}` : `${RenderGlobals.baseUrl}/api/game/image?id=${gameId ?? "null"}&icon=${gameIcon ?? "null"}`

    return <VideoGridItem
        update={update}
        type='clips'
        fileName={`cloud#${id}`}
        key={`VideoGrid-${id}`}
    >
        <HoverVideoWrapper
            source={null}
            cloudId={id}
            w='100%'
            h='100%'
            flex='1'
        >
        </HoverVideoWrapper>
        <GeneralInfoProvider baseName={title}>
            <GeneralInfo
                baseName={title}
                gameName={gameName}
                imageSrc={imageSrc}
                modified={new Date(uploadDate).getTime()}
                cloud={null}
            />
        </GeneralInfoProvider>
    </VideoGridItem>
}