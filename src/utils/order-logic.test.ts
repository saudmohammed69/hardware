import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatMoney,
  calculateLineTotal,
  computeCartTotals,
  isValidIndianPhone,
  canTransitionOrder,
} from './order-logic';

test('formatMoney formats integer and fractional paisa correctly', () => {
  assert.equal(formatMoney(0), '₹0');
  assert.equal(formatMoney(100), '₹1');
  assert.equal(formatMoney(24900), '₹249');
  assert.equal(formatMoney(24950), '₹249.50');
  assert.equal(formatMoney(155000), '₹1,550');
  assert.equal(formatMoney('3500'), '₹35');
});

test('calculateLineTotal handles regular unit items', () => {
  const item = {
    sellingPricePaisa: '2500', // ₹25
    isPipe: false,
  };
  assert.equal(calculateLineTotal(item, 4), 10000); // 4 * ₹25 = ₹100
  assert.equal(calculateLineTotal(item, 0), 0);
});

test('calculateLineTotal handles pipe lengths and extra feet', () => {
  const pipe = {
    sellingPricePaisa: '18000', // ₹180 per length
    lengthPricePaisa: '18000',
    footPricePaisa: '2000', // ₹20 per foot
    isPipe: true,
  };
  // 2 full lengths (2 * 18000 = 36000) + 5 extra feet (5 * 2000 = 10000) = 46000 paisa (₹460)
  assert.equal(calculateLineTotal(pipe, 0, 2, 5), 46000);
});

test('computeCartTotals calculates subtotal, discounts and round off', () => {
  const items = [
    {
      productId: 'p1',
      name: 'Item 1',
      size: '1"',
      unit: 'Piece',
      unitPricePaisa: 2500,
      quantity: 2,
      lineTotalPaisa: 5000,
    },
    {
      productId: 'p2',
      name: 'Item 2',
      size: '500g',
      unit: 'Piece',
      unitPricePaisa: 3000,
      quantity: 1,
      lineTotalPaisa: 3000,
    },
  ];

  const totals = computeCartTotals(items, 1000); // ₹10 discount
  assert.equal(totals.subtotalPaisa, 8000);
  assert.equal(totals.discountPaisa, 1000);
  assert.equal(totals.taxablePaisa, 7000);
  assert.equal(totals.finalTotalPaisa, 7000);
});

test('isValidIndianPhone accepts valid 10-digit Indian numbers', () => {
  assert.equal(isValidIndianPhone('9876543210'), true);
  assert.equal(isValidIndianPhone('+91 9876543210'), true);
  assert.equal(isValidIndianPhone('8123456789'), true);
  assert.equal(isValidIndianPhone('1234567890'), false); // starts with 1
  assert.equal(isValidIndianPhone('98765'), false); // too short
  assert.equal(isValidIndianPhone(''), false);
});

test('canTransitionOrder validates strict status lifecycle', () => {
  assert.equal(canTransitionOrder('NEW', 'ACCEPTED'), true);
  assert.equal(canTransitionOrder('NEW', 'CANCELLED'), true);
  assert.equal(canTransitionOrder('NEW', 'COMPLETED'), false);
  assert.equal(canTransitionOrder('ACCEPTED', 'PREPARING'), true);
  assert.equal(canTransitionOrder('PREPARING', 'READY_FOR_PICKUP'), true);
  assert.equal(canTransitionOrder('READY_FOR_PICKUP', 'BILLING_IN_PROGRESS'), true);
  assert.equal(canTransitionOrder('BILLING_IN_PROGRESS', 'COMPLETED'), true);
  assert.equal(canTransitionOrder('COMPLETED', 'NEW'), false);
});
