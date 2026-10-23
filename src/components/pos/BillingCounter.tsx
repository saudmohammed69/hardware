import React, { useState } from 'react';
import { CartLineItem, CompletedBill, PaymentMode, ShopSettings, WebsiteOrder } from '../../types';
import { formatMoney, computeCartTotals } from '../../utils/order-logic';
import {
  Receipt,
  Trash2,
  Plus,
  Minus,
  Search,
  CheckCircle,
  CreditCard,
  QrCode,
  Banknote,
  ArrowRight,
  User,
  Phone,
  Sparkles,
} from 'lucide-react';

interface BillingCounterProps {
  cart: CartLineItem[];
  sourceOrder: WebsiteOrder | null;
  customerName: string;
  customerPhone: string;
  settings: ShopSettings;
  onUpdateCart: (newCart: CartLineItem[]) => void;
  onClearBill: () => void;
  onFinalizeBill: (bill: CompletedBill) => void;
}

export const BillingCounter: React.FC<BillingCounterProps> = ({
  cart,
  sourceOrder,
  customerName,
  customerPhone,
  settings,
  onUpdateCart,
  onClearBill,
  onFinalizeBill,
}) => {
  const [discountRupees, setDiscountRupees] = useState<number>(0);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [tenderedCash, setTenderedCash] = useState<string>('');
  const [cashierName, setCashierName] = useState<string>('Mohammed Saud');

  const discountPaisa = discountRupees * 100;
  const totals = computeCartTotals(cart, discountPaisa, 18);

  const handleUpdateQty = (productId: string, delta: number) => {
    const updated = cart
      .map((item) => {
        if (item.productId === productId) {
          const newQty = Math.max(1, (item.quantity || 1) + delta);
          const unitRate = item.unitPricePaisa || 0;
          return {
            ...item,
            quantity: newQty,
            lineTotalPaisa: item.isPipe
              ? item.lineTotalPaisa
              : newQty * unitRate,
          };
        }
        return item;
      })
      .filter(Boolean);
    onUpdateCart(updated);
  };

  const handleRemove = (productId: string) => {
    onUpdateCart(cart.filter((item) => item.productId !== productId));
  };

  const handleCompleteSale = () => {
    const bill: CompletedBill = {
      id: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: sourceOrder?.id,
      customerName: customerName || 'Counter Customer',
      customerPhone: customerPhone || '',
      items: cart,
      subtotalPaisa: totals.subtotalPaisa,
      discountPaisa: totals.discountPaisa,
      gstPaisa: totals.gstPaisa,
      roundOffPaisa: totals.roundOffPaisa,
      finalTotalPaisa: totals.finalTotalPaisa,
      paymentMode,
      createdAt: Date.now(),
      cashierName,
    };

    onFinalizeBill(bill);
    setShowPaymentModal(false);
  };

  const changeDuePaisa = tenderedCash
    ? Math.max(0, Number(tenderedCash) * 100 - totals.finalTotalPaisa)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Cart & Lines */}
      <div className="lg:col-span-8 space-y-4">
        {/* Source Order Notification Banner */}
        {sourceOrder && (
          <div className="flex items-center justify-between rounded-2xl bg-amber-500 text-slate-950 p-4 shadow-sm border border-amber-600">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 shrink-0" />
              <div>
                <span className="font-mono font-black text-xs bg-slate-950 text-white px-2 py-0.5 rounded">
                  {sourceOrder.id}
                </span>
                <span className="ml-2 font-bold text-sm">
                  Loaded from Customer Website Order: {sourceOrder.customer.name} (+91 {sourceOrder.customer.phone})
                </span>
              </div>
            </div>
            <button
              onClick={onClearBill}
              className="text-xs font-bold text-slate-900 underline hover:text-black ml-2 shrink-0"
            >
              Clear Cart
            </button>
          </div>
        )}

        {/* Customer Information Block */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase">Customer Invoiced To</div>
              <div className="font-bold text-slate-900 text-sm">
                {customerName || 'Cash / Counter Customer'}
                {customerPhone && <span className="text-slate-500 font-mono text-xs ml-2">({customerPhone})</span>}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Cashier: <strong className="text-slate-800">{cashierName}</strong>
          </div>
        </div>

        {/* Billing Items Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-3.5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Billed Items ({cart.length})
            </h3>
            {cart.length > 0 && (
              <button
                onClick={onClearBill}
                className="text-xs text-rose-600 font-semibold hover:underline"
              >
                Clear all items
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="py-16 text-center">
              <Receipt className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-2 text-sm font-bold text-slate-700">No items in billing register</p>
              <p className="mt-1 text-xs text-slate-400">
                Go to "Web Orders" tab and click "Load into Bill", or select items to invoice.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {item.size} {item.unit && `· ${item.unit}`}
                      {item.isPipe && (
                        <span className="text-amber-800 font-semibold ml-1">
                          ({item.fullLengths} Full Lengths + {item.extraFeet} ft cut)
                        </span>
                      )}
                      {item.note && (
                        <span className="text-amber-600 italic ml-1">"{item.note}"</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!item.isPipe ? (
                      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                        <button
                          onClick={() => handleUpdateQty(item.productId, -1)}
                          className="h-7 w-7 rounded-lg bg-white flex items-center justify-center text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center font-mono text-xs font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(item.productId, 1)}
                          className="h-7 w-7 rounded-lg bg-white flex items-center justify-center text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2 py-1 rounded">
                        {item.fullLengths}L + {item.extraFeet}ft
                      </div>
                    )}

                    <div className="w-24 text-right">
                      <div className="font-mono text-sm font-bold text-slate-900">
                        {formatMoney(item.lineTotalPaisa)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        @{formatMoney(item.unitPricePaisa)}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(item.productId)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Billing Summary & Payment Actions */}
      <div className="lg:col-span-4 space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Invoice Summary
          </h3>

          <div className="space-y-2 text-xs border-b border-slate-100 pb-3">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal:</span>
              <span className="font-mono font-semibold text-slate-900">
                {formatMoney(totals.subtotalPaisa)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Bill Discount (₹):</span>
              <div className="flex items-center gap-1">
                <span className="font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  value={discountRupees || ''}
                  onChange={(e) => setDiscountRupees(Math.max(0, Number(e.target.value)))}
                  placeholder="0"
                  className="w-16 rounded border border-slate-300 px-1.5 py-0.5 text-right font-mono font-bold text-slate-900 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-between text-slate-500">
              <span>CGST (9%):</span>
              <span className="font-mono">{formatMoney(totals.cgstPaisa)}</span>
            </div>

            <div className="flex justify-between text-slate-500">
              <span>SGST (9%):</span>
              <span className="font-mono">{formatMoney(totals.sgstPaisa)}</span>
            </div>

            {totals.roundOffPaisa !== 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Round Off:</span>
                <span className="font-mono">{formatMoney(totals.roundOffPaisa)}</span>
              </div>
            )}
          </div>

          <div>
            <span className="text-xs text-slate-400 uppercase font-bold">Total Amount Due</span>
            <div className="font-mono text-3xl font-black text-slate-950 mt-0.5">
              {formatMoney(totals.finalTotalPaisa)}
            </div>
          </div>

          <button
            onClick={() => setShowPaymentModal(true)}
            disabled={cart.length === 0}
            className="w-full rounded-xl bg-slate-950 py-3.5 font-bold text-white shadow-lg hover:bg-slate-800 active:scale-95 transition disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-2"
          >
            <Banknote className="h-5 w-5 text-amber-400" />
            <span>Collect Payment & Print Bill</span>
          </button>
        </div>
      </div>

      {/* Payment Collection Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Payment Collection</h3>
            <p className="text-xs text-slate-500">
              Total Payable: <strong className="font-mono text-sm text-slate-900">{formatMoney(totals.finalTotalPaisa)}</strong>
            </p>

            {/* Payment Mode Selector */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { mode: 'UPI' as PaymentMode, label: 'UPI QR Code', icon: QrCode },
                { mode: 'CASH' as PaymentMode, label: 'Cash', icon: Banknote },
                { mode: 'SPLIT' as PaymentMode, label: 'Split (Cash+UPI)', icon: CreditCard },
                { mode: 'KHATA_CREDIT' as PaymentMode, label: 'Udhar / Credit', icon: User },
              ].map((item) => (
                <button
                  key={item.mode}
                  type="button"
                  onClick={() => setPaymentMode(item.mode)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition ${
                    paymentMode === item.mode
                      ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Dynamic UPI QR Code View */}
            {paymentMode === 'UPI' && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <div className="inline-block p-2 bg-white rounded-xl shadow-sm border border-slate-200">
                  <QrCode className="h-32 w-32 text-slate-900 mx-auto" />
                </div>
                <div className="mt-2 font-mono text-sm font-black text-slate-900">
                  {formatMoney(totals.finalTotalPaisa)}
                </div>
                <p className="text-[11px] text-slate-500">
                  Scan using Google Pay, PhonePe, Paytm, or BHIM
                </p>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  UPI ID: {settings.upiId}
                </div>
              </div>
            )}

            {/* Cash Tendered Input */}
            {paymentMode === 'CASH' && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cash Tendered from Customer (₹)
                  </label>
                  <input
                    type="number"
                    value={tenderedCash}
                    onChange={(e) => setTenderedCash(e.target.value)}
                    placeholder="Enter amount received (e.g. 500)"
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-mono text-base font-bold text-slate-900 focus:outline-none"
                  />
                </div>
                {Number(tenderedCash) > 0 && (
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-600">Change to return:</span>
                    <span className="font-mono text-base text-emerald-700">
                      {formatMoney(changeDuePaisa)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCompleteSale}
                className="flex-1 rounded-xl bg-amber-600 py-2.5 text-xs font-bold text-white hover:bg-amber-700 transition shadow-md"
              >
                Confirm Payment & Generate Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
