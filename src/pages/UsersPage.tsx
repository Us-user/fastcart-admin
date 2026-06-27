import { useState, useEffect } from 'react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Chip,
  IconButton,
  InputAdornment,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { UserDetailModal } from '@/features/users/components/UserDetailModal';
import { useDeleteUserMutation, useGetUsersQuery } from '@/features/users/usersApi';
import type { UserListItem } from '@/features/users/types';
import { getApiErrorMessage } from '@/shared/lib/apiError';
import { useSnackbar } from '@/shared/lib/useSnackbar';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { DataState } from '@/shared/ui/DataState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PaginationFooter } from '@/shared/ui/PaginationFooter';
import SearchIcon from '@mui/icons-material/Search';

const PAGE_SIZE = 20;

export function UsersPage() {
  const { t } = useTranslation();
  const snackbar = useSnackbar();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [userName, setUserName] = useState('');

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setUserName(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data, isLoading, isError, refetch } = useGetUsersQuery({
    userName: userName || undefined,
    pageNumber: page,
    pageSize: PAGE_SIZE,
  });

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id).unwrap();
      snackbar.success(t('users.toast.deleted', { name: deleteTarget.name }));
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.deleteError')));
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('users.title')}</h1>

        <TextField
          size="small"
          placeholder={t('users.searchPlaceholder')}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ width: 240 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <DataState isLoading={isLoading} isError={isError} onRetry={refetch}>
          {isLoading ? (
            <div className="p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} height={48} className="mb-2" />
              ))}
            </div>
          ) : !data?.items.length ? (
            <EmptyState
              icon={<PersonOutlinedIcon fontSize="large" />}
              title={t('users.empty.title')}
              description={t('users.empty.description')}
            />
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>{t('users.columns.username')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('users.columns.email')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('users.columns.phone')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('users.columns.roles')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {t('common.action')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.map((user: UserListItem) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <span className="font-medium text-slate-800 dark:text-slate-100">
                          {user.userName}
                        </span>
                      </TableCell>
                      <TableCell>{user.email ?? '—'}</TableCell>
                      <TableCell>{user.phoneNumber ?? '—'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <Chip key={role} label={role} size="small" color="primary" variant="outlined" />
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">{t('users.noRoles')}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title={t('users.viewDetail')}>
                          <IconButton size="small" onClick={() => setSelectedUserId(user.id)}>
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.delete')}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteTarget({ id: user.id, name: user.userName })}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataState>

        {data && data.totalPages > 1 && (
          <PaginationFooter
            page={page}
            pageCount={data.totalPages}
            totalCount={data.totalCount}
            onChange={setPage}
          />
        )}
      </div>

      <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />

      <ConfirmDialog
        open={deleteTarget != null}
        title={t('users.deleteDialog.title')}
        message={t('users.deleteDialog.message', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('common.delete')}
        destructive
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={isDeleting}
      />
    </>
  );
}
