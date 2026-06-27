import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { formatCurrency, formatDateTime } from '@/shared/lib/format';
import { getApiErrorMessage } from '@/shared/lib/apiError';
import { getStatusPillClasses } from '@/shared/lib/statusColors';
import { useSnackbar } from '@/shared/lib/useSnackbar';
import { DataState } from '@/shared/ui/DataState';
import { useGetOrderQuery, useSetOrderStatusMutation, useSetPaymentStatusMutation } from '../ordersApi';
import type { OrderStatus, PaymentStatus } from '../types';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../types';

/**
 * Order detail page (TRD §6.2): order items, customer info, addresses, totals,
 * payment method, timestamps, and two separate status controls (order + payment).
 * No dedicated mockup — visual language matches the rest of the app shell.
 */
export function OrderDetail() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);

  const { data: order, isLoading, isError, refetch } = useGetOrderQuery(orderId, {
    skip: !orderId,
  });
  const [setOrderStatus, { isLoading: settingOrderStatus }] = useSetOrderStatusMutation();
  const [setPaymentStatus, { isLoading: settingPaymentStatus }] = useSetPaymentStatusMutation();
  const snackbar = useSnackbar();

  const handleOrderStatus = async (status: OrderStatus) => {
    try {
      await setOrderStatus({ id: orderId, body: { status } }).unwrap();
      snackbar.success(t('orders.toast.statusUpdated'));
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.saveError')));
    }
  };

  const handlePaymentStatus = async (paymentStatus: PaymentStatus) => {
    try {
      await setPaymentStatus({ id: orderId, body: { paymentStatus } }).unwrap();
      snackbar.success(t('orders.toast.paymentStatusUpdated'));
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.saveError')));
    }
  };

  if (!orderId) return null;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <IconButton onClick={() => navigate('/orders')} aria-label={t('orders.backToOrders')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {order
            ? order.orderNumber
              ? `${t('orders.detail.order')} #${order.orderNumber}`
              : `${t('orders.detail.order')} #${orderId}`
            : t('orders.detail.order')}
        </Typography>
      </div>

      <DataState
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        isEmpty={false}
      >
        {order && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left column (2 cols) */}
            <div className="space-y-6 lg:col-span-2">
              {/* Order items */}
              <DetailCard title={t('orders.detail.items')}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-slate-400 dark:border-slate-700 dark:text-slate-500">
                        <th scope="col" className="py-2 pr-4 font-medium">{t('orders.detail.product')}</th>
                        <th scope="col" className="py-2 pr-4 font-medium">{t('orders.detail.sku')}</th>
                        <th scope="col" className="py-2 pr-4 text-center font-medium">{t('orders.detail.qty')}</th>
                        <th scope="col" className="py-2 pr-4 text-right font-medium">{t('orders.detail.unit')}</th>
                        <th scope="col" className="py-2 text-right font-medium">{t('orders.detail.total')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-slate-100 dark:border-slate-800"
                        >
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-3">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.productName}
                                  className="h-10 w-10 shrink-0 rounded-lg object-cover"
                                />
                              ) : (
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400 dark:bg-slate-700 dark:text-slate-500">
                                  —
                                </span>
                              )}
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">
                                  {item.productName}
                                </p>
                                {item.variantOptions && (
                                  <p className="text-xs text-slate-400">{item.variantOptions}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">
                            {item.variantSku ?? '—'}
                          </td>
                          <td className="py-3 pr-4 text-center text-slate-700 dark:text-slate-200">
                            {item.quantity}
                          </td>
                          <td className="py-3 pr-4 text-right text-slate-700 dark:text-slate-200">
                            {formatCurrency(item.unitPrice, i18n.language)}
                          </td>
                          <td className="py-3 text-right font-medium text-slate-900 dark:text-white">
                            {formatCurrency(item.totalPrice, i18n.language)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="mt-4 space-y-1.5 border-t border-slate-200 pt-4 text-sm dark:border-slate-700">
                  <TotalRow label={t('orders.detail.subtotal')} value={formatCurrency(order.subtotal, i18n.language)} />
                  <TotalRow label={t('orders.detail.shipping')} value={formatCurrency(order.shippingCost, i18n.language)} />
                  {order.discount > 0 && (
                    <TotalRow
                      label={t('orders.detail.discount')}
                      value={`− ${formatCurrency(order.discount, i18n.language)}`}
                    />
                  )}
                  <Divider sx={{ my: 1 }} />
                  <TotalRow
                    label={t('orders.detail.grandTotal')}
                    value={formatCurrency(order.total, i18n.language)}
                    bold
                  />
                </div>
              </DetailCard>

              {/* Addresses */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <DetailCard title={t('orders.detail.shippingAddress')}>
                  {order.shippingAddress ? (
                    <AddressBlock address={order.shippingAddress} />
                  ) : (
                    <p className="text-sm text-slate-400">—</p>
                  )}
                </DetailCard>
                <DetailCard title={t('orders.detail.billingAddress')}>
                  {order.billingAddress ? (
                    <AddressBlock address={order.billingAddress} />
                  ) : (
                    <p className="text-sm text-slate-400">{t('orders.detail.sameAsShipping')}</p>
                  )}
                </DetailCard>
              </div>

              {/* Note */}
              {order.customerNote && (
                <DetailCard title={t('orders.detail.note')}>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{order.customerNote}</p>
                </DetailCard>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Status controls (TRD §6.2 — two separate PUT endpoints) */}
              <DetailCard title={t('orders.detail.statusTitle')}>
                <div className="space-y-4">
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {t('orders.detail.orderStatus')}
                    </p>
                    <div className="mb-2">
                      <span
                        className={`inline-block rounded-md px-2.5 py-1 text-xs font-medium ${getStatusPillClasses(order.orderStatus)}`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                    <TextField
                      select
                      size="small"
                      fullWidth
                      value={order.orderStatus}
                      onChange={(e) => void handleOrderStatus(e.target.value as OrderStatus)}
                      disabled={settingOrderStatus}
                      slotProps={{
                        input: {
                          endAdornment: settingOrderStatus ? (
                            <CircularProgress size={14} sx={{ mr: 1 }} />
                          ) : undefined,
                        },
                      }}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <MenuItem key={s} value={s}>
                          {t(`orders.orderStatus.${s}`)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </div>

                  <Divider />

                  <div>
                    <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {t('orders.detail.paymentStatus')}
                    </p>
                    <div className="mb-2">
                      <span
                        className={`inline-block rounded-md px-2.5 py-1 text-xs font-medium ${getStatusPillClasses(order.paymentStatus)}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                    <TextField
                      select
                      size="small"
                      fullWidth
                      value={order.paymentStatus}
                      onChange={(e) => void handlePaymentStatus(e.target.value as PaymentStatus)}
                      disabled={settingPaymentStatus}
                      slotProps={{
                        input: {
                          endAdornment: settingPaymentStatus ? (
                            <CircularProgress size={14} sx={{ mr: 1 }} />
                          ) : undefined,
                        },
                      }}
                    >
                      {PAYMENT_STATUSES.map((s) => (
                        <MenuItem key={s} value={s}>
                          {t(`orders.paymentStatus.${s}`)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </div>
                </div>
              </DetailCard>

              {/* Customer + order info */}
              <DetailCard title={t('orders.detail.customerInfo')}>
                <InfoRow label={t('orders.detail.name')} value={order.customerName} />
                <InfoRow label={t('orders.detail.email')} value={order.customerEmail} />
                <InfoRow
                  label={t('orders.detail.paymentMethod')}
                  value={t(`orders.paymentMethod.${order.paymentMethod}`)}
                />
                <InfoRow
                  label={t('orders.detail.createdAt')}
                  value={formatDateTime(order.createdAt, i18n.language)}
                />
                {order.updatedAt && (
                  <InfoRow
                    label={t('orders.detail.updatedAt')}
                    value={formatDateTime(order.updatedAt, i18n.language)}
                  />
                )}
              </DetailCard>
            </div>
          </div>
        )}
      </DataState>
    </div>
  );
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600 }}
        className="mb-4 text-slate-800 dark:text-white"
      >
        {title}
      </Typography>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2 flex justify-between gap-2 text-sm">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-right font-medium text-slate-800 dark:text-white">{value}</span>
    </div>
  );
}

function TotalRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function AddressBlock({
  address,
}: {
  address: { street: string; city: string; state: string | null; postalCode: string | null; country: string };
}) {
  return (
    <div className="space-y-0.5 text-sm text-slate-700 dark:text-slate-300">
      <p>{address.street}</p>
      <p>
        {address.city}
        {address.state ? `, ${address.state}` : ''}
        {address.postalCode ? ` ${address.postalCode}` : ''}
      </p>
      <p>{address.country}</p>
    </div>
  );
}
