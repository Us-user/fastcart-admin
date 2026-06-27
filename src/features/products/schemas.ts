import type { TFunction } from 'i18next';
import * as yup from 'yup';

import type { ProductCondition } from './types';

/** Translated Yup schema for the Add/Edit product form (TRD §5.3, §13). */

/** Treat an empty select / number input as "no value" so `required`/`min` fire. */
const emptyToUndefined = (value: number, original: unknown) =>
  original === '' || original === null || (typeof original === 'number' && Number.isNaN(value))
    ? undefined
    : value;

export const productSchema = (t: TFunction) =>
  yup.object({
    name: yup
      .string()
      .trim()
      .required(t('validation.required'))
      .max(150, t('validation.maxLength', { count: 150 })),
    code: yup
      .string()
      .trim()
      .required(t('validation.required'))
      .max(50, t('validation.maxLength', { count: 50 })),
    description: yup.string().max(5000, t('validation.maxLength', { count: 5000 })),
    // Category is a filter only — it narrows the subcategory choices and is never
    // sent to the API. It is required so a subcategory can be chosen (TRD §8.1).
    categoryId: yup
      .number()
      .transform(emptyToUndefined)
      .typeError(t('validation.required'))
      .required(t('validation.required')),
    subCategoryId: yup
      .number()
      .transform(emptyToUndefined)
      .typeError(t('validation.required'))
      .required(t('validation.required')),
    brandId: yup.number().transform(emptyToUndefined).optional(),
    condition: yup
      .mixed<ProductCondition>()
      .oneOf(['BrandNew', 'Refurbished', 'Old'])
      .required(t('validation.required')),
    price: yup
      .number()
      .transform(emptyToUndefined)
      .typeError(t('validation.number'))
      .required(t('validation.required'))
      .positive(t('validation.positive')),
    discount: yup
      .number()
      .transform(emptyToUndefined)
      .typeError(t('validation.number'))
      .min(0, t('validation.min', { count: 0 }))
      .test('discount-le-price', t('products.form.discountMax'), function (value) {
        const price = this.parent.price as number | undefined;
        if (value == null || price == null) return true;
        return value <= price;
      })
      .optional(),
    count: yup
      .number()
      .transform(emptyToUndefined)
      .typeError(t('validation.number'))
      .integer(t('validation.integer'))
      .min(0, t('validation.min', { count: 0 }))
      .required(t('validation.required')),
    isTaxable: yup.boolean().required(),
    hasOptions: yup.boolean().required(),
  });

export interface ProductFormValues {
  name: string;
  code: string;
  description: string;
  /** Filter only — not submitted (TRD §8.1). */
  categoryId: number | '';
  subCategoryId: number | '';
  brandId: number | '';
  condition: ProductCondition;
  price: number | '';
  discount: number | '';
  count: number | '';
  isTaxable: boolean;
  hasOptions: boolean;
}
