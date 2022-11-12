import React from "react"
import { Flex, Link, Text } from '@chakra-ui/react';
import Video from './misc';
export default function VideoSingleItem() {
    <Flex w='100%' h='calc(100% - 64px)' justifyContent='center' alignItems='center' flexDir='column' p='10' >
        <Video
            src={`https://clipture.sshcrack.me/${clipUrl}`}
            title={title}
            setWidth={setWidth}
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
                > {title} < /Text>
                    < /Flex>
                    < /Video>
                    < Flex style={{ width: width }
                    }>
                        {dcGameId && <DiscordGame imgSize='2.5rem' fontSize='xl' id={dcGameId} />}
                        {windowInfo && <WindowInfo imgSize='2.5rem' fontSize='xl' info={windowInfo} />}
                        <Flex
                            w='100%'
                            justifyContent='center'
                            alignItems='center'
                        >
                            <LikeButton id={id} />
                            < /Flex>
                            < ClipUser user={uploader} />
                        </Flex>
                        < Link href='mailto:getclipture@gmail.com' > Report < /Link>
                            < /Flex>
}