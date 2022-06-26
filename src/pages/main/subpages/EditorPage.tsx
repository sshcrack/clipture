import { Button, Flex } from '@chakra-ui/react';
import React from 'react';
import { GoChevronLeft } from 'react-icons/go';
import { useParams } from 'react-router-dom';
import EditorCutHighlight from 'src/components/obs/videos/bar/EditorCutHighlight';
import EditorEndBar from 'src/components/obs/videos/bar/EditorEndBar';
import EditorMainBar from 'src/components/obs/videos/bar/EditorMainBar';
import EditorSeekBar from 'src/components/obs/videos/bar/EditorSeekBar';
import EditorStartBar from 'src/components/obs/videos/bar/EditorStartBar';
import Editor from 'src/components/obs/videos/Editor';
import EditorVideo from 'src/components/obs/videos/EditorVideo';
import EditorTimelineTop from 'src/components/obs/videos/timelineTop/EditorTimelineTop';
import TitleBarItem from 'src/components/titlebar/TitleBarItem';
import TitlebarSize from 'src/components/titlebar/TitlebarSize';

export default function EditorPage() {
    const { videoName } = useParams()

    return <TitlebarSize size='50px'>
        <Flex
            w='100%'
            h='100%'
            justifyContent='center'
            alignItems='center'
            flexDir='column'
        >
            <Editor
                key={videoName}
                clipName={videoName}
                onBack={() => window.history.back()}>
                <EditorVideo />
                <EditorMainBar>
                    <EditorCutHighlight bg='editor.highlight' opacity={.5} />
                    <EditorSeekBar />
                    <EditorStartBar
                        bg='editor.highlight'
                        cursor='pointer'
                        h='100%'
                    />
                    <EditorEndBar
                        bg='editor.highlight'
                        cursor='pointer'
                        h='100%'
                    />
                </EditorMainBar>
                <EditorTimelineTop />
            </Editor>
            <TitleBarItem>
                <Button
                    leftIcon={<GoChevronLeft />}
                    onClick={() => window.history.back()}
                    variant='outline'
                    colorScheme='red'
                    ml='2'
                >
                    Exit Editor
                </Button>
            </TitleBarItem>
        </Flex>
    </TitlebarSize>
}