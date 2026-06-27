import { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Switch,
  TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { getApiErrorMessage } from '@/shared/lib/apiError';
import { useSnackbar } from '@/shared/lib/useSnackbar';
import { useCreateCouponMutation, useUpdateCouponMutation } from '../couponsApi';
import { useCouponSchema } from '../couponSchemas';
import type { Coupon, CouponFormValues, CouponRequest } from '../types';

const DISCOUNT_TYPES = ['Percentage', 'FixedAmount'] as const;

interface Props {
  open: boolean;
  coupon: Coupon | null;
  onClose: () => void;
}

function toFormValues(coupon: Coupon | null): CouponFormValues {
  if (!coupon) {
    return {
      code: '',
      discountType: 'Percentage',
      discountValue: '',
      minOrderAmount: '',
      maxDiscountAmount: '',
      startsAt: '',
      expiresAt: '',
      usageLimit: '',
      perUserLimit: '',
      isActive: true,
    };
  }
  return {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue != null ? String(coupon.discountValue) : '',
    minOrderAmount: coupon.minOrderAmount != null ? String(coupon.minOrderAmount) : '',
    maxDiscountAmount: coupon.maxDiscountAmount != null ? String(coupon.maxDiscountAmount) : '',
    startsAt: coupon.startsAt ? coupon.startsAt.slice(0, 16) : '',
    expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 16) : '',
    usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : '',
    perUserLimit: coupon.perUserLimit != null ? String(coupon.perUserLimit) : '',
    isActive: coupon.isActive,
  };
}

function toRequest(values: CouponFormValues): CouponRequest {
  return {
    code: values.code,
    discountType: values.discountType,
    discountValue: values.discountValue !== '' ? Number(values.discountValue) : undefined,
    minOrderAmount: values.minOrderAmount !== '' ? Number(values.minOrderAmount) : undefined,
    maxDiscountAmount: values.maxDiscountAmount !== '' ? Number(values.maxDiscountAmount) : undefined,
    startsAt: values.startsAt || undefined,
    expiresAt: values.expiresAt || undefined,
    usageLimit: values.usageLimit !== '' ? Number(values.usageLimit) : undefined,
    perUserLimit: values.perUserLimit !== '' ? Number(values.perUserLimit) : undefined,
    isActive: values.isActive,
  };
}

export function CouponFormModal({ open, coupon, onClose }: Props) {
  const { t } = useTranslation();
  const snackbar = useSnackbar();
  const schema = useCouponSchema();

  const [createCoupon, { isLoading: creating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: updating }] = useUpdateCouponMutation();
  const isLoading = creating || updating;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CouponFormValues>({
    // yupResolver infers optional fields as `string | undefined`; cast to satisfy the
    // CouponFormValues contract where all string fields default to '' (never undefined).
    resolver: yupResolver(schema) as Resolver<CouponFormValues>,
    defaultValues: toFormValues(coupon),
  });

  useEffect(() => {
    if (open) reset(toFormValues(coupon));
  }, [open, coupon, reset]);

  const onSubmit = (values: CouponFormValues) => {
    const body = toRequest(values);
    const action = coupon
      ? updateCoupon({ id: coupon.id, ...body })
          .unwrap()
          .then(() => snackbar.success(t('marketing.toast.couponUpdated')))
      : createCoupon(body)
          .unwrap()
          .then(() => snackbar.success(t('marketing.toast.couponCreated')));

    action.then(onClose).catch((err: unknown) => {
      snackbar.error(getApiErrorMessage(err, t('common.saveError')));
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 700,
        }}
      >
        {coupon ? t('marketing.editCoupon') : t('marketing.addCoupon')}
        <IconButton onClick={onClose} size="small" edge="end" aria-label={t('common.cancel')}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                {...register('code')}
                label={t('marketing.couponCode')}
                size="small"
                fullWidth
                required
                error={!!errors.code}
                helperText={errors.code?.message}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                {...register('discountType')}
                select
                label={t('marketing.discountType')}
                size="small"
                fullWidth
                defaultValue="Percentage"
                error={!!errors.discountType}
                helperText={errors.discountType?.message}
              >
                {DISCOUNT_TYPES.map((dt) => (
                  <MenuItem key={dt} value={dt}>
                    {t(`marketing.discountType_${dt}`)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={6}>
              <TextField
                {...register('discountValue')}
                label={t('marketing.discountValue')}
                size="small"
                fullWidth
                type="number"
                slotProps={{ htmlInput: { min: 0, step: 'any' } }}
                error={!!errors.discountValue}
                helperText={errors.discountValue?.message}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                {...register('minOrderAmount')}
                label={t('marketing.minOrderAmount')}
                size="small"
                fullWidth
                type="number"
                slotProps={{ htmlInput: { min: 0, step: 'any' } }}
                error={!!errors.minOrderAmount}
                helperText={errors.minOrderAmount?.message}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                {...register('maxDiscountAmount')}
                label={t('marketing.maxDiscountAmount')}
                size="small"
                fullWidth
                type="number"
                slotProps={{ htmlInput: { min: 0, step: 'any' } }}
                error={!!errors.maxDiscountAmount}
                helperText={errors.maxDiscountAmount?.message}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                {...register('startsAt')}
                label={t('marketing.startsAt')}
                size="small"
                fullWidth
                type="datetime-local"
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!errors.startsAt}
                helperText={errors.startsAt?.message}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                {...register('expiresAt')}
                label={t('marketing.expiresAt')}
                size="small"
                fullWidth
                type="datetime-local"
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!errors.expiresAt}
                helperText={errors.expiresAt?.message}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                {...register('usageLimit')}
                label={t('marketing.usageLimit')}
                size="small"
                fullWidth
                type="number"
                slotProps={{ htmlInput: { min: 0, step: 1 } }}
                error={!!errors.usageLimit}
                helperText={errors.usageLimit?.message}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                {...register('perUserLimit')}
                label={t('marketing.perUserLimit')}
                size="small"
                fullWidth
                type="number"
                slotProps={{ htmlInput: { min: 0, step: 1 } }}
                error={!!errors.perUserLimit}
                helperText={errors.perUserLimit?.message}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        size="small"
                      />
                    }
                    label={t('marketing.isActive')}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="outlined" onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button variant="contained" type="submit" disabled={isLoading}>
            {isLoading ? <CircularProgress size={18} color="inherit" /> : t('common.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
