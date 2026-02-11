import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ru from './locales/ru.json'
import ar from './locales/ar.json'

const storedLanguage = (() => {
  try {
    const lang = localStorage.getItem('rh_language')
    if (lang === 'en' || lang === 'ru' || lang === 'ar') return lang
  } catch {
    // localStorage unavailable
  }
  return 'en'
})()

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
    ar: { translation: ar },
  },
  lng: storedLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
