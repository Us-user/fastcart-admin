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

export const tagSchema = (t: TFunction) => yup.object({ name: nameField(t) });

/** Accepts 3- or 6-digit hex with a leading `#` (e.g. `#fff`, `#00599C`). */
const HEX_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const colorSchema = (t: TFunction) =>
  yup.object({
    name: nameField(t),
    hexCode: yup
      .string()
      .trim()
      .required(t('validation.required'))
      .matches(HEX_PATTERN, t('validation.hexCode')),
  });

export interface NameFormValues {
  name: string;
}

export interface ColorFormValues {
  name: string;
  hexCode: string;
}
