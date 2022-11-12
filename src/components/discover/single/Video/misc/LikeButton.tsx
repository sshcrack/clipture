import { Button, Flex, Grid, Spinner, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FaHeart, FaHeartBroken } from 'react-icons/fa';
import { getPageURL } from '../../../util/url';
import { ReactSetState } from '../../../util/validators/interface';

export default function LikeButton({ id, setCount: sC }: { id: string, setCount?: ReactSetState<number> }) {
    const [liked, setLiked] = useState(undefined)
    const [requesting, setRequesting] = useState(false)
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (requesting)
            return

        fetch(`/api/user/like/${id}/has`)
            .then(e => e.json())
            .then(e => {
                setLiked(e.liked ?? null)
                setCount(e.count)
                sC && sC(e.count)
            })

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, requesting])

    const like = (add: boolean) => {
        setRequesting(true)
        fetch(`/api/user/like/${id}/${add ? "add" : "remove"}`)
            .finally(() => setRequesting(false))
    }

    const hoverBg = liked ? "brandSecondary.1000" : "brandPrimary.1000"
    const bg = liked ? "brandSecondary.1200" : "brandPrimary.1200"
    return <Flex justifyContent='center' alignItems='center' gap='3'>
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
                        onClick={() => liked === null ? location.href = getPageURL("/redirects/login", "") : like(!liked)}
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
            <Text gridRow='1' gridColumn='1' opacity='0'>{count +1} likes</Text>
        </Grid>
    </Flex>
}