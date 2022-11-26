import { Storage } from '@Globals/storage';
import i18n from './i18n';

export function getLocalizedT(namespace: string, prefix: string) {
    const lang = Storage.get("language", "en")
    return i18n.getFixedT(lang, namespace, prefix)
}