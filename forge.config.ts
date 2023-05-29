import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import type { ForgeConfig } from '@electron-forge/shared-types';

import MakerWix from '@electron-forge/maker-wix';
import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const config: ForgeConfig = {
    packagerConfig: {
        icon: "./src/assets/main/logo.ico",
        appBundleId: "me.sshcrack.clipture"
    },
    rebuildConfig: {},
    makers: [
        new MakerSquirrel({
            name: "clipture",
            authors: "sshcrack",
            description: "Clip your best in-game moments using clipture!",
            loadingGif: "src/assets/renderer/loading.gif",
            setupIcon: "src/assets/main/logo.ico"
        }),
        new MakerWix({
            manufacturer: "sshcrack",
            name: "Clipture",
            ui: {
                chooseDirectory: true
            }
        }),
        new MakerZIP({})
    ],
    plugins: [
        new WebpackPlugin({
            devContentSecurityPolicy: "default-src 'self' data: 'unsafe-inline' clip-video-file: 'unsafe-eval' https://clipture.sshcrack.me https://cdn.discordapp.com; connect-src https://clipture.sshcrack.me https://cdn.discordapp.com 'self' http://localhost:3000;",
            mainConfig: mainConfig,
            renderer: {
                config: rendererConfig,
                entryPoints: [
                    {
                        html: "./src/pages/global/index.html",
                        js: "./src/pages/main/renderer.ts",
                        name: "main_window",
                        preload: {
                            js: "./src/preload/main/index.ts"
                        }
                    },
                    {
                        html: "./src/pages/global/index.html",
                        js: "./src/pages/overlay/renderer.ts",
                        name: "overlay_window",
                        preload: {
                            js: "./src/preload/overlay/index.ts"
                        }
                    }
                ]
            }
        }),
    ],
};

export default config;
