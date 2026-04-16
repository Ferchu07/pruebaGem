import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar archivos de traducción
import translationEN from './locales/en/translation.json';
import translationES from './locales/es/translation.json';

// Recursos de traducción
const resources = {
  en: {
    translation: translationEN,
  },
  es: {
    translation: translationES,
  },
};

i18n
  // Detectar idioma del navegador
  .use(LanguageDetector)
  // Pasar la instancia i18n a react-i18next
  .use(initReactI18next)
  // Inicializar i18next
  .init({
    resources,
    fallbackLng: 'en', // Idioma por defecto
    debug: process.env.NODE_ENV === 'development',
    supportedLngs: ['en', 'es'],
    load: 'languageOnly',
    cleanCode: true,
    nonExplicitSupportedLngs: true,

    interpolation: {
      escapeValue: false, // React ya escapa por defecto
    },

    // Configuración del detector de idioma
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
