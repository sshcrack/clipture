import { ChakraProvider } from "@chakra-ui/react";
import '@fontsource/varela-round'
import * as React from 'react';
import { createRoot } from "react-dom/client";
import { TitleBar } from 'src/components/titlebar';
import TitlebarBalancer from 'src/components/titlebar/TitlebarBalancer';
import TitleBarProvider from 'src/components/titlebar/TitleBarProvider';
import '../../components/titlebar/style.css';
import "src/pages/main/scrollbar.css";
import theme from "./theme";
import ToastNotifier from './ToastNotifier';



export function renderMain(Comp: () => JSX.Element) {
    const app = document.getElementById("app")
    const root = createRoot(app)
    window.onbeforeunload = () => window.api.shutdown();

    console.log("Rendering...")
    root.render(
        <ChakraProvider theme={theme}>
            <TitleBarProvider>
                <TitleBar icon='../assets/logo.svg' />
                <TitlebarBalancer className='sc2' style={{ overflowY: "hidden" }}>
                    <ToastNotifier />
                    <Comp />
                </TitlebarBalancer>
            </TitleBarProvider>
        </ChakraProvider>
    );

    console.log("Rendered.")
}