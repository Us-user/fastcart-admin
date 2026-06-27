export interface Slider {
  id: number;
  title: string;
  subtitle: string | null;
  sortOrder: number | null;
  isActive: boolean;
  imageUrl: string | null;
}

export interface SliderRequest {
  title: string;
  subtitle?: string;
  sortOrder?: number;
  isActive?: boolean;
  image?: File | null;
}

export interface Banner {
  id: number;
  title: string;
  categoryId: number | null;
  categoryName: string | null;
  endsAt: string | null;
  isActive: boolean;
  imageUrl: string | null;
}

export interface BannerRequest {
  title: string;
  categoryId?: number;
  endsAt?: string;
  isActive?: boolean;
  image?: File | null;
}

export type DiscountType = 'Percentage' | 'FixedAmount';

export interface Coupon {
  id: number;
  code: string;
  discountType: DiscountType;
  discountValue: number | null;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  usageLimit: number | null;
  perUserLimit: number | null;
  isActive: boolean;
}

export interface CouponRequest {
  code: string;
  discountType: DiscountType;
  discountValue?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startsAt?: string;
  expiresAt?: string;
  usageLimit?: number;
  perUserLimit?: number;
  isActive?: boolean;
}

export interface CouponFormValues {
  code: string;
  discountType: DiscountType;
  discountValue: string;
  minOrderAmount: string;
  maxDiscountAmount: string;
  startsAt: string;
  expiresAt: string;
  usageLimit: string;
  perUserLimit: string;
  isActive: boolean;
}
