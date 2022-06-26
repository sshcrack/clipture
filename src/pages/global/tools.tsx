import { ChakraProvider } from "@chakra-ui/react";
import '@fontsource/varela-round'
import * as React from 'react';
import { createRoot } from "react-dom/client";
import { TitleBar } from 'src/components/titlebar';
import TitleBarProvider from 'src/components/titlebar/TitleBarProvider';
import '../../components/titlebar/style.css';
import theme from "./theme";
import ToastNotifier from './ToastNotifier';



export function renderMain(Comp: () => JSX.Element) {
    const app = document.getElementById("app")
    const root = createRoot(app)
    window.onbeforeunload = () => window.api.shutdown();

    console.log("Rendering...")
    root.render(
        <TitleBarProvider>
            <ChakraProvider theme={theme}>
                <TitleBar icon='../assets/logo.svg' />
                <div style={{ height: "calc(100% - 28px)", width: "100%" }}>
                    <ToastNotifier />
                    <Comp />
                </div>
            </ChakraProvider>
        </TitleBarProvider>
    );
    console.log("Rendered.")
}