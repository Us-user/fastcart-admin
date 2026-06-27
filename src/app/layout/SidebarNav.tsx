import type { SvgIconComponent } from '@mui/icons-material';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

interface NavItem {
  to: string;
  labelKey: string;
  icon: SvgIconComponent;
  /** Exact-match active state (for the index "/" route). */
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', labelKey: 'nav.dashboard', icon: HomeOutlinedIcon, end: true },
  { to: '/orders', labelKey: 'nav.orders', icon: FormatListBulletedIcon },
  { to: '/products', labelKey: 'nav.products', icon: LocalOfferOutlinedIcon },
  { to: '/coupons', labelKey: 'nav.coupons', icon: CardGiftcardOutlinedIcon },
  { to: '/returns', labelKey: 'nav.returns', icon: AssignmentReturnOutlinedIcon },
  { to: '/users', labelKey: 'nav.users', icon: PeopleOutlinedIcon },
  { to: '/other', labelKey: 'nav.other', icon: FolderOutlinedIcon },
];

const BASE_ITEM =
  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors';
const ACTIVE_ITEM = 'bg-white text-slate-900 shadow-sm';
const INACTIVE_ITEM = 'text-slate-300 hover:bg-white/5 hover:text-white';

/** Sidebar navigation, shared by the desktop sidebar and the mobile drawer. */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  return (
    <nav className="flex flex-col gap-1 px-4 py-6">
      {NAV_ITEMS.map(({ to, labelKey, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) => `${BASE_ITEM} ${isActive ? ACTIVE_ITEM : INACTIVE_ITEM}`}
        >
          <Icon fontSize="small" />
          <span>{t(labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
