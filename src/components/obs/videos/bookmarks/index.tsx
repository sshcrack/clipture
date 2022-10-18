import { FlexProps, Grid } from "@chakra-ui/react";
import React, { useContext } from "react";
import { EditorMainBarContext } from "../bar/EditorMainBar";
import { EditorContext } from "../Editor";
import EditorBookmark from "./EditorBookmark";

export default function EditorBookmarks(props: FlexProps) {
    const { bookmarks } = useContext(EditorContext)
    const { mainBarRef } = useContext(EditorMainBarContext)

    if (!mainBarRef.current || bookmarks.length === 0)
        return <></>

    const width = mainBarRef.current.clientWidth
    const reactElements = bookmarks.map(e => (
        <EditorBookmark key={`bookmark-${e}`} barW={width} time={e / 1000} />
    ))

    return <Grid
        w='100%' {...props}
        transform='translateY(-1.2em)'
        zIndex='100'
        gridRow='1'
        gridColumn='1'
    >
        {reactElements}
    </Grid>
}