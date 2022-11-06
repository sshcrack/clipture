import { ChakraProvider } from "@chakra-ui/react";
import * as React from 'react';
import { createRoot } from "react-dom/client";
import "src/pages/main/scrollbar.css";
import "../main/global.css"
import "./global.css"
import theme from "../global/theme";



export function renderOverlay(Comp: () => JSX.Element) {
    const app = document.getElementById("app")
    const root = createRoot(app)


    console.log("Rendering...")
    root.render(
        <ChakraProvider theme={theme}>
            <Comp />
        </ChakraProvider>
    );

    console.log("Rendered.")
}