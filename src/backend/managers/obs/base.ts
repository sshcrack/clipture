import { NodeObs as notTypedOBS } from '@streamlabs/obs-studio-node';
import { MainLogger } from 'src/interfaces/mainLogger';
import { SettingsCat } from 'src/types/obs/obs-enums';
import { NodeObs } from 'src/types/obs/obs-studio-node';

const NodeObs: NodeObs = notTypedOBS
const log = MainLogger.get("Backend", "Manager", "OBS", "Base");
export function setOBSSetting(category: SettingsCat, parameter: string, value: string | number) {
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

export function getAvailableValues(category: SettingsCat, subcategory: string, parameter: string) {
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