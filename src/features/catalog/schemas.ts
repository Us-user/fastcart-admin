import type { TFunction } from 'i18next';
import * as yup from 'yup';

/** Translated Yup schemas for the catalog forms (TRD §13 — schemas per entity). */

const nameField = (t: TFunction) =>
  yup
    .string()
    .trim()
    .required(t('validation.required'))
    .max(100, t('validation.maxLength', { count: 100 }));

export const categorySchema = (t: TFunction) => yup.object({ name: nameField(t) });

export const brandSchema = (t: TFunction) => yup.object({ name: nameField(t) });

export const subCategorySchema = (t: TFunction) => yup.object({ name: nameField(t) });

export interface NameFormValues {
  name: string;
}
