import { useMemo } from 'react';
import { Button } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { BackToLoginLink } from '@/features/auth/components/BackToLoginLink';
import { useResetPasswordMutation } from '@/features/auth/authApi';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/features/auth/schemas';
import { getApiErrorMessage } from '@/shared/lib/apiError';
import { useSnackbar } from '@/shared/lib/useSnackbar';
import { PasswordField } from '@/shared/ui/PasswordField';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const [searchParams] = useSearchParams();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  // `email` + `token` arrive from the reset link the backend emails (TRD §3.1).
  const email = searchParams.get('email') ?? '';
  const token = searchParams.get('token') ?? '';

  const resolver = useMemo(() => yupResolver(resetPasswordSchema(t)), [t]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver,
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!email || !token) {
      snackbar.error(t('auth.resetLinkInvalid'));
      return;
    }
    try {
      await resetPassword({
        email,
        token,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      }).unwrap();
      snackbar.success(t('auth.passwordReset'));
      navigate('/login');
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('auth.genericError')));
    }
  });

  return (
    <AuthLayout>
      <form onSubmit={onSubmit} noValidate>
        <BackToLoginLink />
        <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
          {t('auth.resetPasswordTitle')}
        </h1>

        <div className="flex flex-col gap-4">
          <PasswordField
            {...register('newPassword')}
            placeholder={t('auth.password')}
            fullWidth
            error={Boolean(errors.newPassword)}
            helperText={errors.newPassword?.message}
            slotProps={{ htmlInput: { 'aria-label': t('auth.password') } }}
          />
          <PasswordField
            {...register('confirmPassword')}
            placeholder={t('auth.confirmPassword')}
            fullWidth
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword?.message}
            slotProps={{ htmlInput: { 'aria-label': t('auth.confirmPassword') } }}
          />
          <Button type="submit" variant="contained" fullWidth disabled={isLoading}>
            {t('auth.reset')}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
