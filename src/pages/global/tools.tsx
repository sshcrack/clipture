import { ChakraProvider } from "@chakra-ui/react";
import * as React from 'react';
import { createRoot } from "react-dom/client"
import theme from "./theme";


export function renderMain(Comp: () => JSX.Element) {
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