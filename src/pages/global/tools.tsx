import { ChakraProvider } from "@chakra-ui/react";
import * as React from 'react';
import { createRoot } from "react-dom/client";
import RecordErrorListener from 'src/componentsOld/dashboard/error/RecordErrorListener';
import { TitleBar } from 'src/components/titlebar';
import TitlebarBalancer from 'src/components/titlebar/TitlebarBalancer';
import TitleBarProvider from 'src/components/titlebar/TitleBarProvider';
import i18n from "src/locales/i18n";
import "src/pages/main/scrollbar.css";
import '../../components/titlebar/style.css';
import "../main/global.css";
import { addErrorCatch } from './catchErrors';
import OnlyUnminimizedRender from "./OnlyUnminimizedRender";
import theme from "./theme";
import ToastNotifier from './ToastNotifier';

import '@fontsource/inter/400.css'



export function renderMain(Comp: () => JSX.Element) {
    const app = document.getElementById("app")
    const root = createRoot(app)
    window.onbeforeunload = () => window.api.shutdown();
    addErrorCatch()

    console.log("Rendering main...")
    window.api.system.getLanguage()
        .then(e => {
            if (!e)
                return window.api.system.setLanguage(i18n.language)

            i18n.changeLanguage(e)
        })

    i18n.on("languageChanged", lang => {
        console.log("Setting language to", lang)
        window.api.system.setLanguage(lang)
    })

    console.log("Rendering...")
    root.render(
        <ChakraProvider theme={theme}>
            <TitleBarProvider>
                <TitleBar icon='../assets/logo.svg' />
                <TitlebarBalancer className='sc2'>
                    <ToastNotifier />
                    <RecordErrorListener />
                    <OnlyUnminimizedRender>
                        <Comp />
                    </OnlyUnminimizedRender>
                </TitlebarBalancer>
            </TitleBarProvider>
        </ChakraProvider>
    );

    console.log("Rendered.")
}