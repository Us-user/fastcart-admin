import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { Badge, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { BrandLogo } from '@/shared/ui/BrandLogo';
import { UserMenu } from './UserMenu';

/** Global top bar (TRD §4): logo, search, notification bell, user chip. */
export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 flex h-[70px] items-center bg-[#16243b]">
      {/* Logo column — aligns with the sidebar width */}
      <div className="flex h-full w-64 shrink-0 items-center gap-2 px-6">
        <IconButton
          onClick={onMenuClick}
          aria-label={t('nav.openMenu')}
          sx={{ display: { md: 'none' }, color: 'white', ml: -1 }}
        >
          <MenuIcon />
        </IconButton>
        <BrandLogo tone="dark" size={30} />
      </div>

      {/* Search */}
      <div className="hidden items-center gap-2 px-2 text-slate-300 sm:flex">
        <SearchIcon fontSize="small" />
        <input
          type="search"
          placeholder={t('common.searchPlaceholder')}
          aria-label={t('common.search')}
          className="w-64 bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {/* Right cluster */}
      <div className="ml-auto flex items-center gap-3 px-6">
        <IconButton aria-label={t('nav.notifications')} sx={{ color: 'white' }}>
          <Badge color="primary" variant="dot">
            <NotificationsNoneOutlinedIcon />
          </Badge>
        </IconButton>
        <UserMenu />
      </div>
    </header>
  );
}
