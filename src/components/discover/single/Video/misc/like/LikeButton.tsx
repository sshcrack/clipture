import { Button, Flex, Grid, Spinner, Text, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { FaHeart, FaHeartBroken } from 'react-icons/fa';
import { ReactSetState } from 'src/types/reactUtils';
import LikeShortcut from './LikeShortcut';

export default function LikeButton({ id, setCount: sC, listen }: { id: string, setCount?: ReactSetState<number>, listen?: boolean }) {
    const [liked, setLiked] = useState(undefined as boolean)
    const [requesting, setRequesting] = useState(false)
    const [count, setCount] = useState(0)
    const { discover } = window.api.cloud

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
        {listen && <LikeShortcut like={like} liked={liked}/>}
        {
            typeof liked !== "undefined" ?
                (<Grid>
                    <Button
                        gridRow='1'
                        gridColumn='1'
                        isLoading
                        loadingText='Liking...'
                    />
                    <Button
                        gridRow='1'
                        gridColumn='1'
                        bg={bg}
                        _focus={{ background: hoverBg }}
                        _hover={{ background: hoverBg }}
                        isLoading={requesting}
                        loadingText='Liking...'
                        onClick={() => like(!liked)}
                        leftIcon={liked ?
                            <FaHeartBroken /> :
                            <FaHeart />
                        }
                    >{liked ? "Unlike" : "Like"}</Button>
                </Grid>)

                : <Spinner />
        }
        <Grid>
            <Text gridRow='1' gridColumn='1'>{count} like{count > 1 || count === 0 && "s"}</Text>
            <Text gridRow='1' gridColumn='1' opacity='0'>{count + 1} likes</Text>
        </Grid>
    </Flex>
}