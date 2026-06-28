import { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Tooltip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { getApiErrorMessage } from '@/shared/lib/apiError';
import { formatDate } from '@/shared/lib/format';
import { canManageRole, primaryRole, roleRank } from '@/shared/lib/roles';
import { useSnackbar } from '@/shared/lib/useSnackbar';
import {
  useAssignRoleMutation,
  useGetRolesQuery,
  useGetUserQuery,
  useRemoveRoleMutation,
} from '../usersApi';

interface Props {
  userId: string | null;
  onClose: () => void;
}

export function UserDetailModal({ userId, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const snackbar = useSnackbar();
  const locale = i18n.language;

  const { data: user, isLoading } = useGetUserQuery(userId ?? '', { skip: !userId });
  const { data: allRoles = [] } = useGetRolesQuery();
  const [assignRole, { isLoading: isAssigning }] = useAssignRoleMutation();
  const [removeRole, { isLoading: isRemoving }] = useRemoveRoleMutation();
  const busy = isAssigning || isRemoving;

  const currentUser = useAppSelector(selectCurrentUser);
  const myRoles = currentUser?.roles ?? [];
  const myRolesKey = myRoles.join(',');

  // A user has one effective role (its highest level — roles are cumulative).
  const mainRole = user ? primaryRole(user.roles) : null;
  // The admin can change a user's role only when that role is below their own.
  const canEditMain = mainRole == null || canManageRole(myRoles, mainRole);

  // Roles the admin may grant — strictly below their own — shown low → high.
  const assignableRoles = allRoles
    .filter((role) => canManageRole(myRoles, role.name))
    .sort((a, b) => roleRank(a.name) - roleRank(b.name));

  // Single selected role name ('' = none chosen yet).
  const [selected, setSelected] = useState('');
  useEffect(() => {
    if (!user) {
      setSelected('');
      return;
    }
    const mine = myRolesKey ? myRolesKey.split(',') : [];
    const main = primaryRole(user.roles);
    setSelected(main && canManageRole(mine, main) ? main : '');
  }, [user, myRolesKey]);

  // Saving sets the user to exactly the selected role: assign it, then drop every
  // other role the admin is allowed to manage (so one role remains).
  const manageableCurrent = (user?.roles ?? []).filter((name) => canManageRole(myRoles, name));
  const needAdd = selected !== '' && !manageableCurrent.includes(selected);
  const willRemove = manageableCurrent.filter((name) => name !== selected);
  const dirty = needAdd || willRemove.length > 0;

  const saveRole = async () => {
    if (!userId || !user) return;
    if (selected === '') {
      snackbar.error(t('users.detail.needRole'));
      return;
    }
    const target = allRoles.find((r) => r.name === selected);
    if (!target) return;
    const toRemove = allRoles.filter(
      (r) => manageableCurrent.includes(r.name) && r.name !== selected,
    );
    if (!needAdd && toRemove.length === 0) return;
    try {
      if (needAdd) {
        await assignRole({ userId, body: { roleId: target.id } }).unwrap();
      }
      for (const role of toRemove) {
        await removeRole({ userId, roleId: role.id }).unwrap();
      }
      snackbar.success(t('users.detail.roleUpdated'));
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.saveError')));
    }
  };

  return (
    <Dialog
      open={userId != null}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}
      >
        {t('users.detail.title')}
        <IconButton onClick={onClose} size="small" edge="end" aria-label={t('common.cancel')}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {isLoading || !user ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={32} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* User info */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {t('users.detail.username')}
                </p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{user.userName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {t('users.detail.email')}
                </p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  {user.email ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {t('users.detail.phone')}
                </p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  {user.phoneNumber ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {t('users.detail.joined')}
                </p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  {user.createdAt ? formatDate(user.createdAt, locale) : '—'}
                </p>
              </div>
            </div>

            {/* Role */}
            <div>
              <p className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t('users.detail.roles')}
              </p>
              <p className="mb-3 text-xs text-slate-400 dark:text-slate-500">
                {t('users.detail.assignHint')}
              </p>

              {!canEditMain ? (
                // The user's level is at or above the admin's — read-only.
                <Tooltip title={t('users.detail.cantManageRole')}>
                  <span>
                    <Chip label={mainRole} size="small" color="primary" disabled />
                  </span>
                </Tooltip>
              ) : assignableRoles.length === 0 ? (
                <p className="text-sm text-slate-400">{t('users.detail.noAssignableRoles')}</p>
              ) : (
                <div className="flex items-start gap-2">
                  <FormControl fullWidth size="small">
                    <InputLabel id="role-select-label">{t('users.detail.selectRole')}</InputLabel>
                    <Select
                      labelId="role-select-label"
                      label={t('users.detail.selectRole')}
                      value={selected}
                      onChange={(e) => setSelected(e.target.value)}
                    >
                      {assignableRoles.map((role) => (
                        <MenuItem key={role.id} value={role.name}>
                          {role.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    onClick={saveRole}
                    disabled={!dirty || busy}
                    sx={{ flexShrink: 0, mt: 0.25 }}
                  >
                    {t('users.detail.saveRole')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button variant="outlined" color="inherit" onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
