import { DiscoverClip } from '@backend/managers/cloud/interface';
import { Flex, Link, Text } from '@chakra-ui/react';
import { getCloudSourceUrl } from '@general/tools';
import { RenderGlobals } from '@Globals/renderGlobals';
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import Video from './misc';
import CloudGame from './misc/CloudGame';
import LikeButton from './misc/like/LikeButton';
import ClipUser from './misc/User';
export default function VideoSingleItem({ item }: { item: DiscoverClip }) {
    const { title, id, game, uploaderId } = item
    const [uploader, setUploader] = useState(null)
    const [hovered, setHovered] = useState(false)
    const [rndId] = useState(() => Math.random().toString())
    const vidRef = useRef<HTMLVideoElement>(null)
    const { t } = useTranslation("general", { keyPrefix: "video" })

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
    const onHoverLeave = () => window[rndId] = setTimeout(() => setHovered(false), 4000)
    useEffect(() => {
        onHoverEnter()
        onHoverLeave()
    }, [id])

    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if (!vidRef?.current)
                return

            const curr = vidRef.current
            if (e.key === " " || e.key == "k") {
                curr.paused ? curr.play() : curr.pause()
            }

            if (e.key === "j") {
                curr.currentTime = Math.max(0, curr.currentTime - 5)
            }

            if (e.key === "l") {
                curr.currentTime = Math.min(curr.duration, curr.currentTime + 5)
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
                >{title}</Text>
            </Flex>
        </Video>
        < Flex style={{ width: "100%" }}>
            <CloudGame game={game} />
            <Flex
                w='100%'
                justifyContent='center'
                alignItems='center'
            >
                <LikeButton id={id} listen />
            </Flex>
            {uploader && <ClipUser user={uploader} />}
        </Flex>
        <Link href='mailto:getclipture@gmail.com' >{t("report")} </Link>
    </Flex>
}