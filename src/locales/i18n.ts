import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from "src/locales/en.json"
import de from "src/locales/de.json"


// eslint-disable-next-line import/no-named-as-default-member
i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        debug: true,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        },
        resources: {
            en,
            de
        }
    });

export default i18n;
