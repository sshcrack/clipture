import { Storage } from '@Globals/storage';
import { MainLogger } from 'src/interfaces/mainLogger';
import i18n from './i18n';

const log = MainLogger.get("Locales")

log.info("Using locale", Storage.get("language"))
export function getLocalizedT(namespace: string, prefix: string) {
    const lang = Storage.get("language", "en")
    return i18n.getFixedT(lang, namespace, prefix)
}