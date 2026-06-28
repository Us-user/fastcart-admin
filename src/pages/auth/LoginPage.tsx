import { useMemo } from 'react';
import { Button, TextField } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';

import { useAppDispatch } from '@/app/hooks';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { useLoginMutation } from '@/features/auth/authApi';
import { setCredentials } from '@/features/auth/authSlice';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas';
import { getApiErrorMessage } from '@/shared/lib/apiError';
import { useSnackbar } from '@/shared/lib/useSnackbar';
import { PasswordField } from '@/shared/ui/PasswordField';

export function LoginPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const snackbar = useSnackbar();
  const [login, { isLoading }] = useLoginMutation();

  const resolver = useMemo(() => yupResolver(loginSchema(t)), [t]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver, defaultValues: { email: '', password: '' } });

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const onSubmit = handleSubmit(async (values) => {
    try {
      const res = await login({ login: values.email, password: values.password }).unwrap();
      const { accessToken, refreshToken } = res.data;
      dispatch(setCredentials({ accessToken, refreshToken }));
      navigate(from, { replace: true });
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('auth.loginError')));
    }
  });

  return (
    <AuthLayout>
      <form onSubmit={onSubmit} noValidate>
        <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
          {t('auth.login')}
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
          <PasswordField
            {...register('password')}
            placeholder={t('auth.password')}
            fullWidth
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            slotProps={{ htmlInput: { 'aria-label': t('auth.password') } }}
          />
        </div>

        <div className="my-4 text-center">
          <RouterLink
            to="/forgot-password"
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            {t('auth.forgotPassword')}
          </RouterLink>
        </div>

        <Button type="submit" variant="contained" fullWidth disabled={isLoading}>
          {t('auth.login')}
        </Button>
      </form>
    </AuthLayout>
  );
}
