import type { TFunction } from 'i18next';
import * as yup from 'yup';

export const profileSchema = (t: TFunction) =>
  yup.object({
    firstName: yup.string().max(80, t('validation.maxLength', { count: 80 })),
    lastName: yup.string().max(80, t('validation.maxLength', { count: 80 })),
    email: yup.string().email(t('validation.email')),
    phoneNumber: yup.string().max(30, t('validation.maxLength', { count: 30 })),
    dob: yup.string(),
    image: yup.mixed<File>().nullable(),
  });

export const changePasswordSchema = (t: TFunction) =>
  yup.object({
    currentPassword: yup.string().required(t('validation.required')),
    newPassword: yup
      .string()
      .required(t('validation.required'))
      .min(6, t('validation.passwordMin', { count: 6 })),
    confirmPassword: yup
      .string()
      .required(t('validation.required'))
      .oneOf([yup.ref('newPassword')], t('validation.passwordsMatch')),
  });

export interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
