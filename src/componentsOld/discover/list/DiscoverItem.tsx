import { BasicUser } from '@backend/managers/cloud/discover/interface';
import { DiscoverClip } from '@backend/managers/cloud/interface';
import { Flex } from '@chakra-ui/react';
import React, { useEffect, useState } from "react";
import HoverVideoInner from 'src/componentsOld/general/grid/HoverVideo/inner/HoverVideoInner';
import GeneralInfoModified from 'src/componentsOld/general/info/GeneralInfoModified';
import DiscoverContextMenu from 'src/componentsOld/general/menu/DiscoverContextMenu';
import HoverVideoWrapper from '../../general/grid/HoverVideo/HoverVideoWrapper';
import { VideoGridItem } from '../../general/grid/video';
import GeneralInfo from '../../general/info/GeneralInfo';
import GeneralInfoProvider from '../../general/info/GeneralInfoProvider';
import CloudGame from '../single/Video/misc/CloudGame';
import ClipUser from '../single/Video/misc/User';

export type DiscoverItemProps = {
    item: DiscoverClip
}

export default function DiscoverItem({ item }: DiscoverItemProps) {
    const { id, title, uploadDate, uploaderId, game } = item
    const [uploader, setUploader] = useState<BasicUser>(null)
    const [update] = useState(0)
    const { discover } = window.api.cloud


    useEffect(() => {
        discover.user.get(uploaderId)
            .then(e => setUploader(e))
    }, [uploaderId])
    return <DiscoverContextMenu cloudId={id}>
        <VideoGridItem
            update={update}
            type='clips'
            fileName={`cloud#${id}`}
            key={`VideoGrid-${id}`}
            onClick={() => location.hash = `#/videoSingle/${id}`}
        >
            <HoverVideoWrapper
                source={null}
                cloudId={id}
                w='100%'
                h='100%'
                flex='1'
            >
                <HoverVideoInner>
                    <Flex
                        bg='rgba(0,0,0,0.75)'
                        borderTopLeftRadius='2xl'
                        borderBottomRightRadius='2xl'
                        justifyContent='center'
                        alignItems='center'
                        alignSelf='start'
                        gap='2'
                        p='2'
                    >
                        <ClipUser user={uploader} />
                    </Flex>
                </HoverVideoInner>
            </HoverVideoWrapper>
            <GeneralInfoProvider baseName={title} multiSelect={false}>
                <GeneralInfo
                    baseName={title}
                    cloud={null}
                >
                    {game && <CloudGame game={game} />}
                    <GeneralInfoModified modified={new Date(uploadDate).getTime()} />
                </GeneralInfo>
            </GeneralInfoProvider>
        </VideoGridItem>
    </DiscoverContextMenu>
}