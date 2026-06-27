export type OrderStatus = 'New' | 'Ready' | 'Shipped' | 'Received' | 'Cancelled' | 'Returned';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';
export type PaymentMethod = 'CashOnDelivery' | 'Bank';
export type OrderSort = 'newest' | 'oldest' | 'total_asc' | 'total_desc';

export const ORDER_STATUSES: readonly OrderStatus[] = [
  'New',
  'Ready',
  'Shipped',
  'Received',
  'Cancelled',
  'Returned',
];
export const PAYMENT_STATUSES: readonly PaymentStatus[] = ['Pending', 'Paid', 'Failed', 'Refunded'];
export const PAYMENT_METHODS: readonly PaymentMethod[] = ['CashOnDelivery', 'Bank'];

/** A row in `GET /admin/orders` (list payload). */
export interface OrderListItem {
  id: number;
  orderNumber: string | null;
  customerName: string;
  customerEmail: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  createdAt: string;
}

export interface GetOrdersArgs {
  q?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  sort?: OrderSort;
  from?: string;
  to?: string;
  pageNumber?: number;
  pageSize?: number;
}

/** Address used in create and shown in detail. */
export interface AddressInput {
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
}

/** One line item in the Add order form. */
export interface OrderItemInput {
  productVariantId: number;
  quantity: number;
}

/** `POST /admin/orders` request body (TRD §5.2). */
export interface AdminCreateOrderRequest {
  customerName: string;
  customerEmail: string;
  items: OrderItemInput[];
  shippingAddress: AddressInput;
  billingAddress?: AddressInput | null;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  customerNote?: string;
}

/** `PUT /admin/orders/{id}/status` */
export interface SetOrderStatusRequest {
  status: OrderStatus;
}

/** `PUT /admin/orders/{id}/payment-status` */
export interface SetPaymentStatusRequest {
  paymentStatus: PaymentStatus;
}

/* ------------------------------------------------------------------ *
 * Order detail (`GET /admin/orders/{id}`)
 * Field names are assumed from TRD §6.2 + common e-commerce conventions;
 * verify on first real request.
 * ------------------------------------------------------------------ */

export interface OrderItemDetail {
  id: number;
  productId: number;
  productName: string;
  variantId: number;
  variantSku: string | null;
  variantOptions: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl: string | null;
}

export interface OrderAddress {
  street: string;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
}

export interface OrderDetail {
  id: number;
  orderNumber: string | null;
  customerName: string;
  customerEmail: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  items: OrderItemDetail[];
  shippingAddress: OrderAddress | null;
  billingAddress: OrderAddress | null;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  customerNote: string | null;
  createdAt: string;
  updatedAt: string | null;
}

/** Flat form values for Add order (React Hook Form). */
export interface OrderFormValues {
  customerName: string;
  customerEmail: string;
  items: OrderItemInput[];
  shippingStreet: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  useSeparateBilling: boolean;
  billingStreet: string;
  billingCity: string;
  billingState: string;
  billingPostalCode: string;
  billingCountry: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus | '';
  customerNote: string;
}
