import { useState } from 'react';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import {
  Button,
  MenuItem,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useGetReturnsQuery, useResolveReturnMutation } from '@/features/returns/returnsApi';
import type { ReturnItem, ReturnStatus } from '@/features/returns/types';
import { RETURN_STATUSES } from '@/features/returns/types';
import { getApiErrorMessage } from '@/shared/lib/apiError';
import { formatDate } from '@/shared/lib/format';
import { getStatusPillClasses } from '@/shared/lib/statusColors';
import { useSnackbar } from '@/shared/lib/useSnackbar';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { DataState } from '@/shared/ui/DataState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PaginationFooter } from '@/shared/ui/PaginationFooter';

const PAGE_SIZE = 20;

type ResolveAction = 'Approved' | 'Rejected' | 'Completed';

interface ConfirmState {
  item: ReturnItem;
  action: ResolveAction;
}

export function ReturnsPage() {
  const { t, i18n } = useTranslation();
  const snackbar = useSnackbar();
  const locale = i18n.language;

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ReturnStatus | ''>('');
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  const { data, isLoading, isError, refetch } = useGetReturnsQuery({
    status: statusFilter || undefined,
    pageNumber: page,
    pageSize: PAGE_SIZE,
  });

  const [resolveReturn, { isLoading: isResolving }] = useResolveReturnMutation();

  const handleResolve = async () => {
    if (!confirm) return;
    try {
      await resolveReturn({ id: confirm.item.id, body: { returnStatus: confirm.action } }).unwrap();
      snackbar.success(t('returns.toast.resolved', { action: t(`returns.action.${confirm.action}`) }));
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.saveError')));
    } finally {
      setConfirm(null);
    }
  };

  const getActions = (item: ReturnItem): ResolveAction[] => {
    switch (item.returnStatus) {
      case 'Requested':
        return ['Approved', 'Rejected'];
      case 'Approved':
        return ['Completed'];
      default:
        return [];
    }
  };

  const actionIcon = (action: ResolveAction) => {
    if (action === 'Approved') return <ThumbUpOutlinedIcon fontSize="small" />;
    if (action === 'Rejected') return <ThumbDownOutlinedIcon fontSize="small" />;
    return <CheckCircleOutlinedIcon fontSize="small" />;
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('returns.title')}</h1>

        <Select
          size="small"
          value={statusFilter}
          displayEmpty
          onChange={(e) => {
            setStatusFilter(e.target.value as ReturnStatus | '');
            setPage(1);
          }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">{t('returns.allStatuses')}</MenuItem>
          {RETURN_STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              {t(`returns.status.${s}`)}
            </MenuItem>
          ))}
        </Select>
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
              icon={<AssignmentReturnOutlinedIcon fontSize="large" />}
              title={t('returns.empty.title')}
              description={t('returns.empty.description')}
            />
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>{t('returns.columns.id')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('returns.columns.customer')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('returns.columns.product')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('returns.columns.reason')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('returns.columns.status')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('returns.columns.date')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {t('common.action')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.map((item) => {
                    const actions = getActions(item);
                    return (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <span className="font-mono text-sm">#{item.id}</span>
                        </TableCell>
                        <TableCell>{item.customerName ?? '—'}</TableCell>
                        <TableCell>{item.productName ?? '—'}</TableCell>
                        <TableCell>
                          <span className="line-clamp-2 max-w-xs text-sm text-slate-600 dark:text-slate-300">
                            {item.reason ?? '—'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-medium ${getStatusPillClasses(item.returnStatus)}`}
                          >
                            {t(`returns.status.${item.returnStatus}`)}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(item.createdAt, locale)}</TableCell>
                        <TableCell align="right">
                          <div className="flex items-center justify-end gap-1">
                            {actions.map((action) => (
                              <Tooltip key={action} title={t(`returns.action.${action}`)}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color={
                                    action === 'Approved' || action === 'Completed'
                                      ? 'success'
                                      : 'error'
                                  }
                                  startIcon={actionIcon(action)}
                                  onClick={() => setConfirm({ item, action })}
                                  sx={{ minWidth: 0, px: 1 }}
                                >
                                  {t(`returns.action.${action}`)}
                                </Button>
                              </Tooltip>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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

      <ConfirmDialog
        open={confirm != null}
        title={t('returns.confirm.title', {
          action: t(`returns.action.${confirm?.action ?? 'Approved'}`),
        })}
        message={t('returns.confirm.message', {
          action: t(`returns.action.${confirm?.action ?? 'Approved'}`),
          id: confirm?.item.id ?? '',
        })}
        confirmLabel={t(`returns.action.${confirm?.action ?? 'Approved'}`)}
        destructive={confirm?.action === 'Rejected'}
        onConfirm={handleResolve}
        onClose={() => setConfirm(null)}
        loading={isResolving}
      />
    </>
  );
}
