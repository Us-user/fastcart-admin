import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import {
  Button,
  IconButton,
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

import { CouponFormModal } from '@/features/marketing/components/CouponFormModal';
import { useDeleteCouponMutation, useGetCouponsQuery } from '@/features/marketing/couponsApi';
import type { Coupon } from '@/features/marketing/types';
import { getApiErrorMessage } from '@/shared/lib/apiError';
import { formatDate } from '@/shared/lib/format';
import { useSnackbar } from '@/shared/lib/useSnackbar';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { DataState } from '@/shared/ui/DataState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PaginationFooter } from '@/shared/ui/PaginationFooter';

const PAGE_SIZE = 20;

export function CouponsPage() {
  const { t, i18n } = useTranslation();
  const snackbar = useSnackbar();
  const locale = i18n.language;

  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; code: string } | null>(null);

  const { data, isLoading, isError, refetch } = useGetCouponsQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
  });
  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();

  const openCreate = () => {
    setEditCoupon(null);
    setModalOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditCoupon(coupon);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCoupon(deleteTarget.id).unwrap();
      snackbar.success(t('marketing.toast.couponDeleted'));
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.deleteError')));
    } finally {
      setDeleteTarget(null);
    }
  };

  const formatDiscountValue = (coupon: Coupon) => {
    if (coupon.discountValue == null) return '—';
    return coupon.discountType === 'Percentage'
      ? `${coupon.discountValue}%`
      : `$${coupon.discountValue}`;
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          {t('marketing.coupons')}
        </h1>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          {t('marketing.addCoupon')}
        </Button>
      </div>

      {/* Table */}
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
              icon={<LocalOfferOutlinedIcon fontSize="large" />}
              title={t('marketing.noCoupons')}
              description={t('marketing.noCouponsDescription')}
            />
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>{t('marketing.couponCode')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('marketing.discountType')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('marketing.discountValue')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('marketing.minOrderAmount')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('marketing.startsAt')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('marketing.expiresAt')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('marketing.statusLabel')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {t('common.action')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.map((coupon) => (
                    <TableRow key={coupon.id} hover>
                      <TableCell>
                        <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-sm font-medium dark:bg-slate-800">
                          {coupon.code}
                        </span>
                      </TableCell>
                      <TableCell>{t(`marketing.discountType_${coupon.discountType}`)}</TableCell>
                      <TableCell>{formatDiscountValue(coupon)}</TableCell>
                      <TableCell>
                        {coupon.minOrderAmount != null ? `$${coupon.minOrderAmount}` : '—'}
                      </TableCell>
                      <TableCell>
                        {coupon.startsAt ? formatDate(coupon.startsAt, locale) : '—'}
                      </TableCell>
                      <TableCell>
                        {coupon.expiresAt ? formatDate(coupon.expiresAt, locale) : '—'}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${
                            coupon.isActive
                              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                          }`}
                        >
                          {coupon.isActive ? t('marketing.active') : t('marketing.inactive')}
                        </span>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title={t('common.edit')}>
                          <IconButton size="small" onClick={() => openEdit(coupon)}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.delete')}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteTarget({ id: coupon.id, code: coupon.code })}
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

      <CouponFormModal
        open={modalOpen}
        coupon={editCoupon}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmDialog
        open={deleteTarget != null}
        title={t('marketing.deleteCoupon.title')}
        message={t('marketing.deleteCoupon.message', { code: deleteTarget?.code ?? '' })}
        confirmLabel={t('common.delete')}
        destructive
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={isDeleting}
      />
    </>
  );
}
