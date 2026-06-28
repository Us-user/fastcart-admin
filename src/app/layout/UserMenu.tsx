import { useState } from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import { Avatar, Divider, ListItemIcon, Menu, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useGetMeQuery } from '@/features/auth/authApi';
import { useLogout } from '@/features/auth/useLogout';
import { selectThemeMode, toggleThemeMode } from '@/features/theme/themeSlice';

/** Top-bar user chip + dropdown: theme toggle, language switch, logout (TRD §4.2). */
export function UserMenu() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectThemeMode);
  const { data: user } = useGetMeQuery();
  const logout = useLogout();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const navigate = useNavigate();
  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.userName ||
    user?.email ||
    t('user.fallbackName');
  const initial = name.charAt(0).toUpperCase();
  const nextLang = i18n.language.startsWith('ru') ? 'en' : 'ru';

  return (
    <>
      <button
        type="button"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-white/5"
        aria-label={t('user.menu')}
      >
        <Avatar
          src={user?.imageUrl}
          sx={{ width: 36, height: 36, bgcolor: '#22c55e', fontSize: 16, fontWeight: 600 }}
        >
          {initial}
        </Avatar>
        <span className="hidden text-sm font-medium text-white sm:block">{name}</span>
        <ArrowDropDownIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
      </button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 200, mt: 1 } } }}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            navigate('/profile');
          }}
        >
          <ListItemIcon>
            <PersonOutlinedIcon fontSize="small" />
          </ListItemIcon>
          {t('profile.title')}
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => dispatch(toggleThemeMode())}>
          <ListItemIcon>
            {mode === 'dark' ? (
              <LightModeOutlinedIcon fontSize="small" />
            ) : (
              <DarkModeOutlinedIcon fontSize="small" />
            )}
          </ListItemIcon>
          {t(mode === 'dark' ? 'theme.light' : 'theme.dark')}
        </MenuItem>
        <MenuItem onClick={() => void i18n.changeLanguage(nextLang)}>
          <ListItemIcon>
            <TranslateOutlinedIcon fontSize="small" />
          </ListItemIcon>
          {t('language.switchTo', { lang: nextLang.toUpperCase() })}
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            void logout();
          }}
        >
          <ListItemIcon>
            <LogoutOutlinedIcon fontSize="small" />
          </ListItemIcon>
          {t('nav.logout')}
        </MenuItem>
      </Menu>
    </>
  );
}
