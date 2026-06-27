import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import {
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  Tooltip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { getApiErrorMessage } from '@/shared/lib/apiError';
import { formatDate } from '@/shared/lib/format';
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

  const userRoleNames = new Set(user?.roles ?? []);

  const handleAssign = async (roleId: string, roleName: string) => {
    if (!userId) return;
    try {
      await assignRole({ userId, body: { roleId } }).unwrap();
      snackbar.success(t('users.toast.roleAssigned', { role: roleName }));
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.saveError')));
    }
  };

  const handleRemove = async (roleId: string, roleName: string) => {
    if (!userId) return;
    try {
      await removeRole({ userId, roleId }).unwrap();
      snackbar.success(t('users.toast.roleRemoved', { role: roleName }));
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

            {/* Roles */}
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t('users.detail.roles')}
              </p>
              {allRoles.length === 0 ? (
                <p className="text-sm text-slate-400">{t('users.detail.noRoles')}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allRoles.map((role) => {
                    const assigned = userRoleNames.has(role.name);
                    return (
                      <Chip
                        key={role.id}
                        label={role.name}
                        color={assigned ? 'primary' : 'default'}
                        variant={assigned ? 'filled' : 'outlined'}
                        size="small"
                        disabled={isAssigning || isRemoving}
                        deleteIcon={
                          assigned ? (
                            <Tooltip title={t('users.detail.removeRole')}>
                              <DeleteOutlineIcon />
                            </Tooltip>
                          ) : undefined
                        }
                        onDelete={assigned ? () => handleRemove(role.id, role.name) : undefined}
                        onClick={!assigned ? () => handleAssign(role.id, role.name) : undefined}
                        sx={{ cursor: assigned ? 'default' : 'pointer' }}
                      />
                    );
                  })}
                </div>
              )}
              {(isAssigning || isRemoving) && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <CircularProgress size={12} />
                  {t('common.loading')}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button variant="contained" onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
