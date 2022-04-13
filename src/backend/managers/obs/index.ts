import { EOBSSettingsCategories as SettingCat, NodeObs } from '@streamlabs/obs-studio-node'
import { mainStore as store } from '@Globals/storage'
import { v4 as uuid } from "uuid"
import { MainLogger } from '../../../interfaces/mainLogger'
import { getOBSDataPath, getOBSWorkingDir } from './tool'


const log = MainLogger.get("Managers", "OBS")
export class OBSManager {
    private obsInitialized = false

    private async initialize() {
        if (this.obsInitialized)
            return log.warn("OBS already initialized")

        await this.initOBS()
        await this.configure()
        this.obsInitialized = true
    }

    private async initOBS() {
        const hostId = `clipture-${uuid()}`;
        const workDir = getOBSWorkingDir()

        log.debug(`Initializing OBS... (${hostId}}`);
        NodeObs.IPC.host(hostId);
        NodeObs.SetWorkingDirectory(workDir);

        const obsDataPath = getOBSDataPath()
        const initResult = NodeObs.OBS_API_initAPI("en-US", obsDataPath, "1.0.0") as number;
        if (initResult !== 0) {
            const errorReasons = {
                "-2": "DirectX could not be found on your system. Please install the latest version of DirectX for your machine here <https://www.microsoft.com/en-us/download/details.aspx?id=35?> and try again.",
                "-5": "Failed to initialize OBS. Your video drivers may be out of date, or libObs may not be supported on your system.",
            };


            const result = initResult.toString() as keyof typeof errorReasons;
            const errorMessage = errorReasons[result] ?? `An unknown error #${initResult} was encountered while initializing OBS.`;

            log.error("Could not initialize OBS", errorMessage);
            this.shutdown(true);

            throw Error(errorMessage);
        }

        log.info("Successfully initialized OBS!")
        log.info("Performance", NodeObs.OBS_API_getPerformanceData())
    }

    public async shutdown(force = false) {
        if (!this.obsInitialized && !force)
            return

        try {
            NodeObs.OBS_service_removeCallback();
            NodeObs.IPC.disconnect()
        } catch (e) {
            const newErr = new Error(`Exception when shutting down OBS process${e}`)
            log.error(newErr)

            throw newErr;
        }
    }

    private configure() {
        log.info("Configuring OBS")
        const Output = SettingCat.Output
        const Video = SettingCat.Video


        const availableEncoders = this.getAvailableValues(Output, 'Recording', 'RecEncoder');
        this.setSetting(Output, "Mode", "Advanced")
        this.setSetting(Output, 'RecEncoder', availableEncoders.slice(-1)[0] ?? 'x264');
        this.setSetting(Output, 'RecFilePath', store.get("clip_path"));
        this.setSetting(Output, 'RecFormat', 'mkv');
        this.setSetting(Output, 'VBitrate', 10000); // 10 Mbps
        this.setSetting(Video, 'FPSCommon', 60);

        log.info("Configured OBS successfully!")
    }


    private setSetting(category: SettingCat, parameter: string, value: string | number) {
        let oldValue: string | number;
        const settings = NodeObs.OBS_settings_getSettings(category).data;

        settings.forEach(subCategory => {
            subCategory.parameters.forEach(param => {
                if (param.name === parameter) {
                    oldValue = param.currentValue;
                    param.currentValue = value;
                }
            });
        });

        if (value === oldValue)
            return

        NodeObs.OBS_settings_saveSettings(category, settings);
    }

    private getAvailableValues(category: SettingCat, subcategory: string, parameter: string) {
        const categorySettings = NodeObs.OBS_settings_getSettings(category).data;
        if (!categorySettings) {
            log.warn(`There is no category ${category} in OBS settings`);
            return [];
        }

        const subcategorySettings = categorySettings.find(sub => sub.nameSubCategory === subcategory);
        if (!subcategorySettings) {
            log.warn(`There is no subcategory ${subcategory} for OBS settings category ${category}`);
            return [];
        }

        const parameterSettings = subcategorySettings.parameters.find(param => param.name === parameter);
        if (!parameterSettings) {
            log.warn(`There is no parameter ${parameter} for OBS settings category ${category}.${subcategory}`);
            return [];
        }

        return parameterSettings.values.map(value => Object.values(value)[0]);
    }

}