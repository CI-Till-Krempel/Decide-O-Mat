import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import de from './locales/de.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export const updateDocumentLang = (lng) => {
  if (typeof document !== 'undefined' && document.documentElement) {
    const lang = (lng || 'en').split('-')[0];
    document.documentElement.lang = lang;
  }
};

updateDocumentLang(i18n.resolvedLanguage || i18n.language || 'en');

i18n.on('languageChanged', (lng) => {
  updateDocumentLang(lng);
});

export default i18n;
