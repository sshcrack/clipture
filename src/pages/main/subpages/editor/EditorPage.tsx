import { Flex } from '@chakra-ui/react';
import React from 'react';
import { useParams } from 'react-router-dom';
import EditorCutBar from 'src/componentsOld/obs/videos/bar/EditorCutBar';
import EditorCutHighlight from 'src/componentsOld/obs/videos/bar/EditorCutHighlight';
import EditorMainBar from 'src/componentsOld/obs/videos/bar/EditorMainBar';
import EditorSeekBar from 'src/componentsOld/obs/videos/bar/EditorSeekBar';
import EditorTitlebar from 'src/componentsOld/obs/videos/bar/EditorTitlebar';
import EditorBookmarks from 'src/componentsOld/obs/videos/bookmarks';
import Editor from 'src/componentsOld/obs/videos/Editor';
import EditorVideo from 'src/componentsOld/obs/videos/EditorVideo';
import EditorTimelineTop from 'src/componentsOld/obs/videos/timelineTop/EditorTimelineTop';
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
                    <EditorBookmarks />
                    <EditorCutHighlight bg='editor.highlight' opacity={.25} />
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
                <EditorTimelineTop/>
                <EditorTitlebar />
            </Editor>
        </Flex>
    </TitlebarSize>
}