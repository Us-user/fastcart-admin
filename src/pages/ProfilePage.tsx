import { useEffect, useRef, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import {
  Avatar,
  Button,
  CircularProgress,
  IconButton,
  TextField,
  Tooltip,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useChangePasswordMutation } from '@/features/auth/authApi';
import { useGetProfileQuery } from '@/features/profile/profileApi';
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordFormValues,
} from '@/features/profile/schemas';
import type { ProfileFormValues } from '@/features/profile/types';
import { useUpdateProfile } from '@/features/profile/useUpdateProfile';
import { getApiErrorMessage } from '@/shared/lib/apiError';
import { useSnackbar } from '@/shared/lib/useSnackbar';
import { DataState } from '@/shared/ui/DataState';
import { PasswordField } from '@/shared/ui/PasswordField';

export function ProfilePage() {
  const { t } = useTranslation();
  const snackbar = useSnackbar();

  const { data: profile, isLoading, isError, refetch } = useGetProfileQuery();
  const { updateProfile, isSaving } = useUpdateProfile();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    setValue: setProfileValue,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: yupResolver(profileSchema(t)) as never,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      dob: '',
      image: null,
    },
  });

  const {
    register: registerPwd,
    handleSubmit: handlePwdSubmit,
    reset: resetPwd,
    formState: { errors: pwdErrors },
  } = useForm<ChangePasswordFormValues>({
    resolver: yupResolver(changePasswordSchema(t)),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      resetProfile({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        email: profile.email ?? '',
        phoneNumber: profile.phoneNumber ?? '',
        dob: profile.dob ? profile.dob.slice(0, 10) : '',
        image: null,
      });
      setAvatarPreview(null);
    }
  }, [profile, resetProfile]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileValue('image', file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onProfileSubmit = async (values: ProfileFormValues) => {
    try {
      await updateProfile({
        FirstName: values.firstName || undefined,
        LastName: values.lastName || undefined,
        Email: values.email || undefined,
        PhoneNumber: values.phoneNumber || undefined,
        Dob: values.dob || undefined,
        Image: values.image ?? undefined,
      });
      snackbar.success(t('profile.toast.updated'));
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.saveError')));
    }
  };

  const onPasswordSubmit = async (values: ChangePasswordFormValues) => {
    try {
      await changePassword(values).unwrap();
      snackbar.success(t('profile.toast.passwordChanged'));
      resetPwd();
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.saveError')));
    }
  };

  const displayName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || t('user.fallbackName');
  const avatarSrc = avatarPreview ?? profile?.imageUrl;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <PersonOutlinedIcon className="text-slate-500" />
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          {t('profile.title')}
        </h1>
      </div>

      <DataState isLoading={isLoading} isError={isError} onRetry={refetch}>
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Profile info card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-5 text-base font-semibold text-slate-700 dark:text-slate-300">
              {t('profile.section.info')}
            </h2>

            {/* Avatar */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <Avatar
                  src={avatarSrc}
                  sx={{
                    width: 96,
                    height: 96,
                    bgcolor: '#22c55e',
                    fontSize: 36,
                    fontWeight: 700,
                  }}
                >
                  {initial}
                </Avatar>
                <Tooltip title={t('profile.changePhoto')}>
                  <IconButton
                    onClick={handleAvatarClick}
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                      width: 28,
                      height: 28,
                    }}
                  >
                    <CameraAltOutlinedIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <form onSubmit={handleProfileSubmit(onProfileSubmit)} noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  label={t('profile.fields.firstName')}
                  size="small"
                  fullWidth
                  {...registerProfile('firstName')}
                  error={Boolean(profileErrors.firstName)}
                  helperText={profileErrors.firstName?.message}
                />
                <TextField
                  label={t('profile.fields.lastName')}
                  size="small"
                  fullWidth
                  {...registerProfile('lastName')}
                  error={Boolean(profileErrors.lastName)}
                  helperText={profileErrors.lastName?.message}
                />
                <TextField
                  label={t('profile.fields.email')}
                  type="email"
                  size="small"
                  fullWidth
                  {...registerProfile('email')}
                  error={Boolean(profileErrors.email)}
                  helperText={profileErrors.email?.message}
                />
                <TextField
                  label={t('profile.fields.phoneNumber')}
                  size="small"
                  fullWidth
                  {...registerProfile('phoneNumber')}
                  error={Boolean(profileErrors.phoneNumber)}
                  helperText={profileErrors.phoneNumber?.message}
                />
                <TextField
                  label={t('profile.fields.dob')}
                  type="date"
                  size="small"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  {...registerProfile('dob')}
                  error={Boolean(profileErrors.dob)}
                  helperText={profileErrors.dob?.message}
                  className="sm:col-span-2"
                />
              </div>

              <div className="mt-5 flex justify-end">
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSaving}
                  startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}
                >
                  {isSaving ? t('common.loading') : t('common.save')}
                </Button>
              </div>
            </form>
          </div>

          {/* Change password card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center gap-2">
              <LockOutlinedIcon fontSize="small" className="text-slate-500" />
              <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300">
                {t('profile.section.changePassword')}
              </h2>
            </div>

            <form onSubmit={handlePwdSubmit(onPasswordSubmit)} noValidate>
              <div className="space-y-4">
                <PasswordField
                  label={t('profile.fields.currentPassword')}
                  size="small"
                  fullWidth
                  {...registerPwd('currentPassword')}
                  error={Boolean(pwdErrors.currentPassword)}
                  helperText={pwdErrors.currentPassword?.message}
                />
                <PasswordField
                  label={t('profile.fields.newPassword')}
                  size="small"
                  fullWidth
                  {...registerPwd('newPassword')}
                  error={Boolean(pwdErrors.newPassword)}
                  helperText={pwdErrors.newPassword?.message}
                />
                <PasswordField
                  label={t('profile.fields.confirmPassword')}
                  size="small"
                  fullWidth
                  {...registerPwd('confirmPassword')}
                  error={Boolean(pwdErrors.confirmPassword)}
                  helperText={pwdErrors.confirmPassword?.message}
                />
              </div>

              <div className="mt-5 flex justify-end">
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isChangingPassword}
                  startIcon={
                    isChangingPassword ? <CircularProgress size={16} color="inherit" /> : null
                  }
                >
                  {isChangingPassword ? t('common.loading') : t('profile.changePasswordBtn')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DataState>
    </>
  );
}
