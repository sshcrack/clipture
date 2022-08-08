import { Flex } from '@chakra-ui/react';
import React from 'react';
import { useParams } from 'react-router-dom';
import EditorCutBar from 'src/components/obs/videos/bar/EditorCutBar';
import EditorCutHighlight from 'src/components/obs/videos/bar/EditorCutHighlight';
import EditorMainBar from 'src/components/obs/videos/bar/EditorMainBar';
import EditorSeekBar from 'src/components/obs/videos/bar/EditorSeekBar';
import EditorTitlebar from 'src/components/obs/videos/bar/EditorTitlebar';
import Editor from 'src/components/obs/videos/Editor';
import EditorVideo from 'src/components/obs/videos/EditorVideo';
import EditorTimelineTop from 'src/components/obs/videos/timelineTop/EditorTimelineTop';
import TitlebarSize from 'src/components/titlebar/TitlebarSize';

export default function EditorPage() {
    const { videoName } = useParams()

    return <TitlebarSize size='50px'>
        <Flex
            pt='3'
            w='100%'
            h='100%'
            justifyContent='center'
            alignItems='center'
            flexDir='column'
        >
            <Flex h='100%' flex='1'></Flex>
            <Editor
                key={videoName}
                videoName={videoName}
                onBack={() => window.history.back()}>
                <EditorVideo h='100%' />
                <EditorMainBar>
                    <EditorCutHighlight bg='editor.highlight' opacity={.5} />
                    <EditorSeekBar />
                    <EditorCutBar
                        type="start"
                        bg='editor.highlight'
                        cursor='pointer'
                        h='100%'
                    />
                    <EditorCutBar
                        type="end"
                        bg='editor.highlight'
                        cursor='pointer'
                        h='100%'
                    />
                </EditorMainBar>
                <EditorTimelineTop />
                <EditorTitlebar />
            </Editor>
        </Flex>
    </TitlebarSize>
}