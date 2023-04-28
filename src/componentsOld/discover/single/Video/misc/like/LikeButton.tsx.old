import { Button, Flex, Grid, Spinner, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaHeart, FaHeartBroken } from 'react-icons/fa';
import { ReactSetState } from 'src/types/reactUtils';
import LikeShortcut from './LikeShortcut';

export default function LikeButton({ id, setCount: sC, listen }: { id: string, setCount?: ReactSetState<number>, listen?: boolean }) {
    const [liked, setLiked] = useState(undefined as boolean)
    const [requesting, setRequesting] = useState(false)
    const [count, setCount] = useState(0)
    const { discover } = window.api.cloud
    const { t } = useTranslation("discover", { keyPrefix: "button.like" })

    const toast = useToast()
    useEffect(() => {
        if (requesting)
            return

        discover.like.has(id)
            .then(e => {
                console.log("Liked has", e.liked)
                setLiked(e.liked ?? null)
                setCount(e.count)
                sC && sC(e.count)
            })

    }, [id, requesting])


    const like = (add: boolean) => {
        setRequesting(true)
        console.log("Setting with id", id, "add", add)
        discover.like.set(id, add)
            .catch(e => {
                console.error(e)
                toast({
                    status: "error",
                    description: e?.message ?? e?.stack ?? e
                })
            })
            .finally(() => setRequesting(false))
    }

    const hoverBg = liked ? "brandSecondary.1000" : "brandPrimary.1000"
    const bg = liked ? "brandSecondary.1200" : "brandPrimary.1200"
    return <Flex
        justifyContent='center'
        alignItems='center'
        gap='3'
    >
        {listen && <LikeShortcut like={like} liked={liked} />}
        {
            typeof liked !== "undefined" ?
                (<Grid>
                    <Button
                        gridRow='1'
                        gridColumn='1'
                        isLoading
                        loadingText={t("loading")}
                    />
                    <Button
                        gridRow='1'
                        gridColumn='1'
                        bg={bg}
                        _focus={{ background: hoverBg }}
                        _hover={{ background: hoverBg }}
                        isLoading={requesting}
                        loadingText={t("loading")}
                        onClick={() => like(!liked)}
                        leftIcon={liked ?
                            <FaHeartBroken /> :
                            <FaHeart />
                        }
                    >{liked ? t("unlike", { likes: count }) : t("like", { likes: count })}</Button>
                </Grid>)

                : <Spinner />
        }
    </Flex>
}