import React, { useEffect, useState, useRef } from "react"
import { Flex, Link, Text } from '@chakra-ui/react';
import Video from './misc';
import DiscordGame from './misc/DiscordGame';
import WindowInfo from './misc/WindowInfo';
import { DiscoverClip } from '@backend/managers/cloud/interface';
import LikeButton from './misc/like/LikeButton';
import ClipUser from './misc/User';
import { getCloudSourceUrl } from '@general/tools';
import { RenderGlobals } from '@Globals/renderGlobals';
export default function VideoSingleItem({ item }: { item: DiscoverClip }) {
    const { title, id, dcGameId, uploaderId, windowInfo } = item
    const [width, setWidth] = useState("100%")
    const [uploader, setUploader] = useState(null)
    const [hovered, setHovered] = useState(false)
    const [rndId] = useState(() => Math.random().toString())
    const vidRef = useRef<HTMLVideoElement>(null)

    const onHoverEnter = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const t = window[rndId] as NodeJS.Timeout
        setHovered(true)
        if (!t)
            return

        clearTimeout(t)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        window[rndId] = null
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const onHoverLeave = () => window[rndId] = setTimeout(() => setHovered(false), 3000)
    useEffect(() => {
        onHoverEnter()
        onHoverLeave()
    }, [id])

    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if (e.key === " ") {
                vidRef?.current && vidRef.current.play()
            }
        }

        window.addEventListener("keyup", listener)
        return () => window.removeEventListener("keyup", listener)
    }, [vidRef])

    useEffect(() => {
        if (!uploaderId)
            return

        window.api.cloud.discover.user.get(uploaderId)
            .then(e => {
                if (Object.keys(e).length === 0)
                    return

                setUploader(e)
            })
    }, [uploaderId])

    return <Flex w='100%' h='calc(100% - 64px)' justifyContent='center' alignItems='center' flexDir='column' p='10' pl='0' pr='0' position='relative'>
        <Video
            vidRef={vidRef}
            src={getCloudSourceUrl(RenderGlobals.baseUrl, id)}
            title={title}
            setWidth={setWidth}
            hovered={hovered}
            setHovered={setHovered}
        >
            <Flex
                flex='1'
                justifyContent='center'
                alignItems='center'
            >
                <Text
                    fontSize='xl'
                    boxShadow='0 0 10px 6px black'
                    bg='black'
                > {title} </Text>
            </Flex>
        </Video>
        < Flex style={{ width: width }}>
            {(!dcGameId && !windowInfo) && <DiscordGame imgSize='2.5rem' fontSize='xl' id='' />}
            {dcGameId && <DiscordGame imgSize='2.5rem' fontSize='xl' id={dcGameId} />}
            {windowInfo && <WindowInfo imgSize='2.5rem' fontSize='xl' info={windowInfo} />}
            <Flex
                w='100%'
                justifyContent='center'
                alignItems='center'
            >
                <LikeButton id={id} listen/>
            </Flex>
            {uploader && <ClipUser user={uploader} />}
        </Flex>
        <Link href='mailto:getclipture@gmail.com' > Report </Link>
    </Flex>
}