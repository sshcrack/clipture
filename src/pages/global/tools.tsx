import { ChakraProvider } from "@chakra-ui/react";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import theme from "./theme";


export function renderMain(Comp: () => JSX.Element) {
    const app = document.getElementById("app")

    console.log("Rendering...")
    ReactDOM.render(
        <ChakraProvider theme={theme}>
            <Comp />
        </ChakraProvider>
    , app, () => console.log("Rendered."));
}