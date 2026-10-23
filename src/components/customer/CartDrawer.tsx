import React from 'react';
import { CartLineItem } from '../../types';
import { formatMoney } from '../../utils/order-logic';
import { X, Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartLineItem[];
  orderNote: string;
  setOrderNote: (note: string) => void;
  missingRequest: string;
  setMissingRequest: (req: string) => void;
  onUpdateQuantity: (productId: string, newQty: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  orderNote,
  setOrderNote,
  missingRequest,
  setMissingRequest,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const totalPaisa = cart.reduce((acc, item) => acc + (item.lineTotalPaisa || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">Your Shopping Cart</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-600">
              {cart.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="h-12 w-12 text-slate-300" />
              <p className="mt-3 text-base font-bold text-slate-700">Your cart is empty</p>
              <p className="mt-1 text-xs text-slate-400">
                Browse our catalog and add items you need for pickup.
              </p>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                      <p className="text-xs text-slate-500">
                        {item.size} {item.unit && `· ${item.unit}`}
                      </p>
                      {item.isPipe && (
                        <div className="mt-1 inline-block rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                          {item.fullLengths || 0} lengths + {item.extraFeet || 0} ft cut
                        </div>
                      )}
                      {item.note && (
                        <p className="mt-1 text-xs italic text-amber-700">
                          Note: "{item.note}"
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-slate-900">
                        {formatMoney(item.lineTotalPaisa)}
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.productId)}
                        className="mt-1 text-xs text-rose-500 hover:text-rose-700"
                        title="Remove item"
                      >
                        <Trash2 className="h-3.5 w-3.5 inline" />
                      </button>
                    </div>
                  </div>

                  {/* Quantity adjustment if not pipe */}
                  {!item.isPipe && (
                    <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2">
                      <span className="text-xs text-slate-500">Quantity</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                          className="h-7 w-7 rounded bg-white border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-700 hover:bg-slate-100"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center font-mono text-xs font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                          className="h-7 w-7 rounded bg-white border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-700 hover:bg-slate-100"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Order Notes & Missing Request */}
              <div className="pt-2 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Order Instructions (Optional)
                  </label>
                  <textarea
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="e.g. Keep ready by 5 PM, or specific cutting requirements..."
                    rows={2}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Need an item not found in catalog?
                  </label>
                  <input
                    type="text"
                    value={missingRequest}
                    onChange={(e) => setMissingRequest(e.target.value)}
                    placeholder="e.g. 2 rolls of 2.5mm Finolex wire"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Staff will review and add it to your invoice at the counter.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer with Subtotal & Checkout */}
        {cart.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">Estimated Total</span>
                <p className="text-[11px] text-slate-400">Pay at counter upon pickup</p>
              </div>
              <div className="font-mono text-2xl font-black text-slate-900">
                {formatMoney(totalPaisa)}
              </div>
            </div>

            <button
              onClick={onProceedToCheckout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-amber-600/25 hover:bg-amber-700 active:scale-95 transition"
            >
              <span>Continue to Customer Details</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
