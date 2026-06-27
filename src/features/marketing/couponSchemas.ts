import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

export function useCouponSchema() {
  const { t } = useTranslation();
  return yup.object({
    code: yup.string().max(64, t('validation.maxLength', { count: 64 })).required(t('validation.required')),
    discountType: yup.string().oneOf(['Percentage', 'FixedAmount']).required(t('validation.required')),
    discountValue: yup
      .string()
      .test('is-num', t('validation.number'), (v) => !v || !isNaN(Number(v)))
      .test('is-pos', t('validation.positive'), (v) => !v || Number(v) >= 0),
    minOrderAmount: yup
      .string()
      .test('is-num', t('validation.number'), (v) => !v || !isNaN(Number(v)))
      .test('is-pos', t('validation.positive'), (v) => !v || Number(v) >= 0),
    maxDiscountAmount: yup
      .string()
      .test('is-num', t('validation.number'), (v) => !v || !isNaN(Number(v)))
      .test('is-pos', t('validation.positive'), (v) => !v || Number(v) >= 0),
    startsAt: yup.string(),
    expiresAt: yup.string(),
    usageLimit: yup
      .string()
      .test('is-int', t('validation.integer'), (v) => !v || Number.isInteger(Number(v)))
      .test('is-pos', t('validation.positive'), (v) => !v || Number(v) >= 0),
    perUserLimit: yup
      .string()
      .test('is-int', t('validation.integer'), (v) => !v || Number.isInteger(Number(v)))
      .test('is-pos', t('validation.positive'), (v) => !v || Number(v) >= 0),
    isActive: yup.boolean(),
  });
}
