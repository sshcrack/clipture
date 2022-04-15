import { ChakraProvider } from "@chakra-ui/react";
import '../../components/titlebar/style.css'
import * as React from 'react';
import { createRoot } from "react-dom/client"
import { TitleBar } from 'src/components/titlebar';

import theme from "./theme";


export function renderMain(Comp: () => JSX.Element) {
    const app = document.getElementById("app")
    const root = createRoot(app)

    console.log("Rendering...")
    root.render(
        <ChakraProvider theme={theme}>
            <TitleBar icon='/assets/logo.svg'/>
            <div style={{height: "calc(100% - 28px)", width: "100%"}}>
                <Comp />
            </div>
        </ChakraProvider>
    );
    console.log("Rendered.")
}