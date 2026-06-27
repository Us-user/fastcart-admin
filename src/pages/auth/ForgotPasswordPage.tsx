import { useMemo } from 'react';
import { Button, TextField } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { BackToLoginLink } from '@/features/auth/components/BackToLoginLink';
import { useForgotPasswordMutation } from '@/features/auth/authApi';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/features/auth/schemas';
import { getApiErrorMessage } from '@/shared/lib/apiError';
import { useSnackbar } from '@/shared/lib/useSnackbar';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const resolver = useMemo(() => yupResolver(forgotPasswordSchema(t)), [t]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver, defaultValues: { email: '' } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await forgotPassword({ email: values.email }).unwrap();
      snackbar.success(t('auth.resetLinkSent'));
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
          {t('auth.forgotPasswordTitle')}
        </h1>

        <div className="flex flex-col gap-4">
          <TextField
            {...register('email')}
            type="email"
            placeholder={t('auth.email')}
            fullWidth
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            slotProps={{ htmlInput: { 'aria-label': t('auth.email') } }}
          />
          <Button type="submit" variant="contained" fullWidth disabled={isLoading}>
            {t('auth.sendResetLink')}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
