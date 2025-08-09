import { Button, Menu, MenuItem } from '@mui/material';
import {
  AccountCircle as UserIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Translate as LanguageIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import './UserMenu.css';

const UserMenu = ({ darkMode, toggleTheme, toggleLanguage }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { t } = useTranslation();
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<UserIcon />}
        onClick={handleMenuClick}
        className="user-menu-button"
      >
        {t('userMenu')}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          className: 'user-menu-paper'
        }}
      >
        <MenuItem onClick={() => {
          toggleTheme();
          handleMenuClose();
        }}>
          {darkMode
            ? <LightModeIcon className="user-menu-icon" />
            : <DarkModeIcon className="user-menu-icon" />}
          {darkMode ? t('lightMode') : t('darkMode')}
        </MenuItem>

        <MenuItem onClick={() => {
          toggleLanguage();
          handleMenuClose();
        }}>
          <LanguageIcon className="user-menu-icon" />
          {t('changeLanguage')}
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;
