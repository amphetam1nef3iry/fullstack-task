import { Search } from '@mui/icons-material';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          lightMode: 'Light Mode',
          darkMode: 'Dark Mode',
          changeLanguage: 'Change Language',
          userMenu: "User Menu",
          search: "Search",
          saveState: "Save state",
          resetState "Reset state",
          orderUpdated: "Order updated seccessfull"
        }
      },
      ru: {
        translation: {
          lightMode: 'Светлая тема',
          darkMode: 'Тёмная тема',
          changeLanguage: 'Сменить язык',
          userMenu: "Меню",
          search: "Поиск",
          saveState: "Сохранить состояние",
          resetState: "Сбросить состояние",
          orderUpdated: "Порядок успешно обновлен"
        }
      }
    },
    lng: localStorage.getItem('language') || 'ru',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
