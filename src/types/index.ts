export interface ProductVariant {
  id: string;
  name: string;
  category?: string;
  type?: string;
  size: string;
  unit: string;
  sellingPricePaisa: string | number;
  gstRateBp?: number;
  isPipe?: boolean;
  lengthPricePaisa?: string | number;
  footPricePaisa?: string | number;
  feetPerLength?: number;
  aliases?: string;
}

export interface CatalogFamily {
  name: string;
  category: string;
  products: ProductVariant[];
  search: string;
  isPipe: boolean;
}

export interface CartLineItem {
  productId: string;
  name: string;
  size: string;
  unit: string;
  unitPricePaisa: number;
  quantity: number;
  isPipe?: boolean;
  fullLengths?: number;
  extraFeet?: number;
  note?: string;
  lineTotalPaisa: number;
}

export type OrderStatus =
  | 'NEW'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'BILLING_IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface CustomerInfo {
  name: string;
  phone: string;
  pickupPreference?: string;
  address?: string;
}

export interface WebsiteOrder {
  id: string; // UUID (matches Android Room database primary key)
  orderNumber?: string; // Display number like "WO-8842"
  revision?: number; // Monotonically increasing revision
  seq?: number; // Monotonically increasing sequence cursor
  customer: CustomerInfo;
  items: CartLineItem[];
  orderNote?: string;
  missingItemRequest?: string;
  subtotalPaisa: number;
  estimatedGstPaisa: number;
  totalPaisa: number;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
  checklist?: string[]; // array of completed productIds
  unread?: boolean;
  billedBillId?: string;
  cancellationReason?: string;
  claimDevice?: string;
  claimToken?: string;
  serverBillId?: string;
  finalizedPosBillSyncId?: string;
}

export type PaymentMode = 'CASH' | 'UPI' | 'SPLIT' | 'KHATA_CREDIT';

export interface CompletedBill {
  id: string; // e.g. "INV-2026-0042"
  orderId?: string;
  orderNumber?: string;
  customerName: string;
  customerPhone: string;
  items: CartLineItem[];
  subtotalPaisa: number;
  discountPaisa: number;
  gstPaisa: number;
  roundOffPaisa: number;
  finalTotalPaisa: number;
  paymentMode: PaymentMode;
  splitCashPaisa?: number;
  splitUpiPaisa?: number;
  createdAt: number;
  cashierName: string;
}

export interface ShopSettings {
  shopName: string;
  shopPhone: string;
  shopAddress: string;
  gstin: string;
  upiId: string;
  upiPayeeName: string;
  openTime: string;
  closeTime: string;
  onlineOrderingActive: boolean;
}
