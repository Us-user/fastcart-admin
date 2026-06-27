import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { getApiErrorMessage } from '@/shared/lib/apiError';
import { useSnackbar } from '@/shared/lib/useSnackbar';
import { useCreateOrderMutation } from '../ordersApi';
import { orderSchema } from '../schemas';
import type {
  AdminCreateOrderRequest,
  OrderFormValues,
  PaymentMethod,
  PaymentStatus,
} from '../types';
import { PAYMENT_METHODS, PAYMENT_STATUSES } from '../types';

const DEFAULT_VALUES: OrderFormValues = {
  customerName: '',
  customerEmail: '',
  items: [{ productVariantId: 0, quantity: 1 }],
  shippingStreet: '',
  shippingCity: '',
  shippingState: '',
  shippingPostalCode: '',
  shippingCountry: '',
  useSeparateBilling: false,
  billingStreet: '',
  billingCity: '',
  billingState: '',
  billingPostalCode: '',
  billingCountry: '',
  paymentMethod: 'CashOnDelivery',
  paymentStatus: '',
  customerNote: '',
};

/** Add order form (TRD §5.2) — reuses product-form visual language. */
export function OrderForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: yupResolver(orderSchema) as never,
    defaultValues: DEFAULT_VALUES,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const useSeparateBilling = watch('useSeparateBilling');

  const onSubmit = async (values: OrderFormValues) => {
    const body: AdminCreateOrderRequest = {
      customerName: values.customerName,
      customerEmail: values.customerEmail,
      items: values.items.map((item) => ({
        productVariantId: Number(item.productVariantId),
        quantity: Number(item.quantity),
      })),
      shippingAddress: {
        street: values.shippingStreet,
        city: values.shippingCity,
        state: values.shippingState || undefined,
        postalCode: values.shippingPostalCode || undefined,
        country: values.shippingCountry,
      },
      billingAddress: values.useSeparateBilling
        ? {
            street: values.billingStreet,
            city: values.billingCity,
            state: values.billingState || undefined,
            postalCode: values.billingPostalCode || undefined,
            country: values.billingCountry,
          }
        : undefined,
      paymentMethod: values.paymentMethod as PaymentMethod,
      paymentStatus: (values.paymentStatus as PaymentStatus) || undefined,
      customerNote: values.customerNote || undefined,
    };

    try {
      const created = await createOrder(body).unwrap();
      snackbar.success(t('orders.toast.created'));
      navigate(`/orders/${created.id}`);
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.saveError')));
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconButton onClick={() => navigate('/orders')} aria-label={t('orders.backToOrders')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {t('orders.form.title')}
          </Typography>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outlined" onClick={() => navigate('/orders')}>
            {t('common.cancel')}
          </Button>
          <Button variant="contained" onClick={() => void handleSubmit(onSubmit)()} disabled={isLoading}>
            {t('orders.form.createOrder')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Customer */}
          <SectionCard title={t('orders.form.customer')}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label={t('orders.form.customerName')}
                {...register('customerName')}
                error={Boolean(errors.customerName)}
                helperText={errors.customerName?.message}
                required
              />
              <TextField
                label={t('orders.form.customerEmail')}
                type="email"
                {...register('customerEmail')}
                error={Boolean(errors.customerEmail)}
                helperText={errors.customerEmail?.message}
                required
              />
            </div>
          </SectionCard>

          {/* Items */}
          <SectionCard title={t('orders.form.items')}>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-3">
                  <TextField
                    label={t('orders.form.variantId')}
                    type="number"
                    {...register(`items.${index}.productVariantId`, { valueAsNumber: true })}
                    error={Boolean(errors.items?.[index]?.productVariantId)}
                    helperText={errors.items?.[index]?.productVariantId?.message}
                    required
                    sx={{ flex: 2 }}
                    slotProps={{ htmlInput: { min: 1 } }}
                  />
                  <TextField
                    label={t('orders.form.quantity')}
                    type="number"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    error={Boolean(errors.items?.[index]?.quantity)}
                    helperText={errors.items?.[index]?.quantity?.message}
                    required
                    sx={{ flex: 1 }}
                    slotProps={{ htmlInput: { min: 1 } }}
                  />
                  <IconButton
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    aria-label={t('orders.form.removeItem')}
                    sx={{ mt: 1 }}
                  >
                    <DeleteOutlineIcon className="text-red-500" />
                  </IconButton>
                </div>
              ))}
              {errors.items?.message && (
                <FormHelperText error>{errors.items.message}</FormHelperText>
              )}
            </div>
            <Button
              startIcon={<AddIcon />}
              onClick={() => append({ productVariantId: 0, quantity: 1 })}
              sx={{ mt: 2 }}
            >
              {t('orders.form.addItem')}
            </Button>
          </SectionCard>

          {/* Shipping address */}
          <SectionCard title={t('orders.form.shippingAddress')}>
            <AddressFields prefix="shipping" register={register} errors={errors} />
          </SectionCard>

          {/* Billing address */}
          <SectionCard title={t('orders.form.billingAddress')}>
            <Controller
              name="useSeparateBilling"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox checked={field.value} onChange={field.onChange} />}
                  label={t('orders.form.differentBilling')}
                  sx={{ mb: 2 }}
                />
              )}
            />
            {useSeparateBilling && (
              <AddressFields prefix="billing" register={register} errors={errors} />
            )}
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Payment */}
          <SectionCard title={t('orders.form.payment')}>
            <FormControl component="fieldset" error={Boolean(errors.paymentMethod)}>
              <FormLabel component="legend" sx={{ mb: 1, fontSize: 14 }}>
                {t('orders.form.paymentMethod')}
              </FormLabel>
              <Controller
                name="paymentMethod"
                control={control}
                render={({ field }) => (
                  <RadioGroup {...field}>
                    {PAYMENT_METHODS.map((m) => (
                      <FormControlLabel
                        key={m}
                        value={m}
                        control={<Radio size="small" />}
                        label={t(`orders.paymentMethod.${m}`)}
                      />
                    ))}
                  </RadioGroup>
                )}
              />
            </FormControl>

            <TextField
              select
              label={t('orders.form.paymentStatus')}
              {...register('paymentStatus')}
              error={Boolean(errors.paymentStatus)}
              helperText={errors.paymentStatus?.message}
              fullWidth
              sx={{ mt: 2 }}
            >
              <MenuItem value="">{t('orders.form.paymentStatusOptional')}</MenuItem>
              {PAYMENT_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {t(`orders.paymentStatus.${s}`)}
                </MenuItem>
              ))}
            </TextField>
          </SectionCard>

          {/* Note */}
          <SectionCard title={t('orders.form.note')}>
            <TextField
              label={t('orders.form.customerNote')}
              multiline
              minRows={3}
              fullWidth
              {...register('customerNote')}
              error={Boolean(errors.customerNote)}
              helperText={errors.customerNote?.message}
            />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }} className="mb-4 text-slate-800 dark:text-white">
        {title}
      </Typography>
      {children}
    </div>
  );
}

interface AddressFieldsProps {
  prefix: 'shipping' | 'billing';
  register: ReturnType<typeof useForm<OrderFormValues>>['register'];
  errors: ReturnType<typeof useForm<OrderFormValues>>['formState']['errors'];
}

function AddressFields({ prefix, register, errors }: AddressFieldsProps) {
  const { t } = useTranslation();
  const e = errors as Record<string, { message?: string } | undefined>;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <TextField
        label={t('orders.form.street')}
        {...register(`${prefix}Street` as never)}
        error={Boolean(e[`${prefix}Street`])}
        helperText={e[`${prefix}Street`]?.message}
        required
        sx={{ gridColumn: 'span 2' }}
        className="sm:col-span-2"
      />
      <TextField
        label={t('orders.form.city')}
        {...register(`${prefix}City` as never)}
        error={Boolean(e[`${prefix}City`])}
        helperText={e[`${prefix}City`]?.message}
        required
      />
      <TextField
        label={t('orders.form.state')}
        {...register(`${prefix}State` as never)}
        error={Boolean(e[`${prefix}State`])}
        helperText={e[`${prefix}State`]?.message}
      />
      <TextField
        label={t('orders.form.postalCode')}
        {...register(`${prefix}PostalCode` as never)}
        error={Boolean(e[`${prefix}PostalCode`])}
        helperText={e[`${prefix}PostalCode`]?.message}
      />
      <TextField
        label={t('orders.form.country')}
        {...register(`${prefix}Country` as never)}
        error={Boolean(e[`${prefix}Country`])}
        helperText={e[`${prefix}Country`]?.message}
        required
      />
    </div>
  );
}
