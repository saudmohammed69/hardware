import { CartLineItem, OrderStatus, ProductVariant } from '../types';

/**
 * Formats paisa (100 paisa = ₹1) into standard Indian Rupees (₹) string.
 * Example: 24900 -> "₹249" or 24950 -> "₹249.50"
 */
export function formatMoney(paisa: number | string | bigint): string {
  try {
    const n = BigInt(Math.max(0, Math.floor(Number(paisa))));
    const whole = n / 100n;
    const frac = n % 100n;
    const wholeFormatted = whole.toLocaleString('en-IN');
    if (frac === 0n) {
      return `₹${wholeFormatted}`;
    }
    return `₹${wholeFormatted}.${frac.toString().padStart(2, '0')}`;
  } catch {
    return '₹0';
  }
}

/**
 * Calculates line total for a regular or pipe product
 */
export function calculateLineTotal(
  product: Pick<ProductVariant, 'sellingPricePaisa' | 'isPipe' | 'lengthPricePaisa' | 'footPricePaisa'>,
  quantity: number,
  pipeLengths: number = 0,
  extraFeet: number = 0
): number {
  if (product.isPipe) {
    const lengthPrice = Number(product.lengthPricePaisa || product.sellingPricePaisa || 0);
    const footPrice = Number(product.footPricePaisa || 0);
    const lengthsTotal = Math.max(0, pipeLengths) * lengthPrice;
    const feetTotal = Math.max(0, extraFeet) * footPrice;
    return Math.round(lengthsTotal + feetTotal);
  }

  const unitPrice = Number(product.sellingPricePaisa || 0);
  const qty = Math.max(0, quantity);
  return Math.round(qty * unitPrice);
}

/**
 * Computes cart totals including subtotal and optional GST breakdown
 */
export function computeCartTotals(
  items: CartLineItem[],
  discountPaisa: number = 0,
  gstPercentage: number = 18
): {
  subtotalPaisa: number;
  discountPaisa: number;
  taxablePaisa: number;
  gstPaisa: number;
  cgstPaisa: number;
  sgstPaisa: number;
  roundOffPaisa: number;
  finalTotalPaisa: number;
} {
  const subtotalPaisa = items.reduce((acc, item) => acc + (item.lineTotalPaisa || 0), 0);
  const discount = Math.min(subtotalPaisa, Math.max(0, discountPaisa));
  const taxablePaisa = subtotalPaisa - discount;

  // Assuming items prices are GST inclusive or GST extra based on store setting (standard in Indian hardware retail is GST inclusive or calculated on taxable base)
  // Here we compute the 18% GST component (9% CGST + 9% SGST)
  const gstPaisa = Math.round((taxablePaisa * gstPercentage) / 100);
  const cgstPaisa = Math.round(gstPaisa / 2);
  const sgstPaisa = gstPaisa - cgstPaisa;

  const rawTotal = taxablePaisa; // Indian retail displayed prices are already tax-inclusive
  // Round off to nearest rupee (100 paisa)
  const remainder = rawTotal % 100;
  let roundOffPaisa = 0;
  if (remainder >= 50) {
    roundOffPaisa = 100 - remainder;
  } else if (remainder > 0) {
    roundOffPaisa = -remainder;
  }

  const finalTotalPaisa = rawTotal + roundOffPaisa;

  return {
    subtotalPaisa,
    discountPaisa: discount,
    taxablePaisa,
    gstPaisa,
    cgstPaisa,
    sgstPaisa,
    roundOffPaisa,
    finalTotalPaisa,
  };
}

/**
 * Validates Indian 10-digit mobile number
 */
export function isValidIndianPhone(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10 && /^[6-9]\d{9}$/.test(clean)) return true;
  if (clean.length === 12 && clean.startsWith('91') && /^[6-9]\d{9}$/.test(clean.slice(2))) return true;
  return false;
}

/**
 * Validates whether order status transition is allowed
 */
export function canTransitionOrder(current: OrderStatus, next: OrderStatus): boolean {
  const transitions: Record<OrderStatus, OrderStatus[]> = {
    NEW: ['ACCEPTED', 'CANCELLED'],
    ACCEPTED: ['PREPARING', 'READY_FOR_PICKUP', 'CANCELLED'],
    PREPARING: ['READY_FOR_PICKUP', 'BILLING_IN_PROGRESS', 'CANCELLED'],
    READY_FOR_PICKUP: ['BILLING_IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    BILLING_IN_PROGRESS: ['COMPLETED', 'READY_FOR_PICKUP', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  };

  return transitions[current]?.includes(next) ?? false;
}

/**
 * Normalizes text for search indexing
 */
export function normalizeSearch(text: string): string {
  return String(text || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
