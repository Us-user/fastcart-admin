import type { TFunction } from 'i18next';
import * as yup from 'yup';

/** Translated Yup schemas for the auth forms (TRD §13 — schemas per entity). */

export const loginSchema = (t: TFunction) =>
  yup.object({
    email: yup.string().required(t('validation.required')).email(t('validation.email')),
    password: yup.string().required(t('validation.required')),
  });

export const forgotPasswordSchema = (t: TFunction) =>
  yup.object({
    email: yup.string().required(t('validation.required')).email(t('validation.email')),
  });

export const resetPasswordSchema = (t: TFunction) =>
  yup.object({
    newPassword: yup
      .string()
      .required(t('validation.required'))
      .min(6, t('validation.passwordMin', { count: 6 })),
    confirmPassword: yup
      .string()
      .required(t('validation.required'))
      .oneOf([yup.ref('newPassword')], t('validation.passwordsMatch')),
  });

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface ForgotPasswordFormValues {
  email: string;
}

export interface ResetPasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}
