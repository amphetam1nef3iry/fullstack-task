import React, { useState, useEffect } from 'react';
import List from './List/List';
import UserMenu from './UserMenu/UserMenu';
import CssBaseline from '@mui/material/CssBaseline';
import { useTranslation } from 'react-i18next';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const { i18n } = useTranslation();

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'ru');

  const toggleTheme = () => {
    setDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('darkMode', newMode);
      document.body.classList.toggle('dark-mode', newMode);
      return newMode;
    });
  };

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const toggleLanguage = () => {
    setLanguage(prev => {
      const newLang = prev === 'ru' ? 'en' : 'ru';
      i18n.changeLanguage(newLang);
      localStorage.setItem('language', newLang);
      return newLang;
    });
  };

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const theme = createTheme({
    palette: {
      mode: 'light',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app">
        <div className="app-header">
          <UserMenu 
            darkMode={darkMode} 
            toggleTheme={toggleTheme} 
            toggleLanguage={toggleLanguage} 
          />
        </div>
        <List apiUrl={API_URL} />
      </div>
    </ThemeProvider>
  );
}

export default App;
