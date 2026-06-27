import * as yup from 'yup';
import i18n from '@/app/i18n';

const t = (key: string, opts?: Record<string, unknown>) => i18n.t(key, opts);

const addressSchema = yup.object({
  street: yup.string().required(() => t('validation.required')),
  city: yup.string().required(() => t('validation.required')),
  state: yup.string(),
  postalCode: yup.string(),
  country: yup.string().required(() => t('validation.required')),
});

export const orderSchema = yup.object({
  customerName: yup.string().required(() => t('validation.required')),
  customerEmail: yup
    .string()
    .email(() => t('validation.email'))
    .required(() => t('validation.required')),
  items: yup
    .array(
      yup.object({
        productVariantId: yup
          .number()
          .typeError(() => t('validation.number'))
          .positive(() => t('validation.positive'))
          .integer(() => t('validation.integer'))
          .required(() => t('validation.required')),
        quantity: yup
          .number()
          .typeError(() => t('validation.number'))
          .positive(() => t('validation.positive'))
          .integer(() => t('validation.integer'))
          .required(() => t('validation.required')),
      }),
    )
    .min(1, () => t('orders.form.itemsRequired')),
  shippingStreet: yup.string().required(() => t('validation.required')),
  shippingCity: yup.string().required(() => t('validation.required')),
  shippingState: yup.string(),
  shippingPostalCode: yup.string(),
  shippingCountry: yup.string().required(() => t('validation.required')),
  useSeparateBilling: yup.boolean(),
  billingStreet: yup.string().when('useSeparateBilling', {
    is: true,
    then: (s) => s.required(() => t('validation.required')),
  }),
  billingCity: yup.string().when('useSeparateBilling', {
    is: true,
    then: (s) => s.required(() => t('validation.required')),
  }),
  billingState: yup.string(),
  billingPostalCode: yup.string(),
  billingCountry: yup.string().when('useSeparateBilling', {
    is: true,
    then: (s) => s.required(() => t('validation.required')),
  }),
  paymentMethod: yup.string().required(() => t('validation.required')),
  paymentStatus: yup.string(),
  customerNote: yup.string(),
});

export { addressSchema };
