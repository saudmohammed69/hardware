import React, { useState } from 'react';
import { CartLineItem, CustomerInfo, WebsiteOrder } from '../../types';
import { formatMoney, isValidIndianPhone } from '../../utils/order-logic';
import { X, CheckCircle, Clock, Phone, User, AlertCircle, ShoppingBag } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartLineItem[];
  orderNote: string;
  missingRequest: string;
  onOrderSubmitted: (order: WebsiteOrder) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  orderNote,
  missingRequest,
  onOrderSubmitted,
}) => {
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [pickupSlot, setPickupSlot] = useState<string>('Ready for pickup in 30–60 mins');
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalPaisa = cart.reduce((acc, item) => acc + (item.lineTotalPaisa || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!isValidIndianPhone(phone)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      const customer: CustomerInfo = {
        name: name.trim(),
        phone: phone.trim().replace(/\D/g, '').slice(-10),
        pickupPreference: pickupSlot,
        address: address.trim() || undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          items: cart,
          orderNote: orderNote.trim() || undefined,
          missingItemRequest: missingRequest.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to submit order to shop');
      }

      const data = await res.json();
      if (data.order) {
        onOrderSubmitted(data.order);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong while placing your order. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close checkout"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Direct Shop Counter Pickup</span>
          </div>
          <h2 className="mt-2 text-xl font-bold text-slate-900">Enter Pickup Details</h2>
          <p className="text-xs text-slate-500">
            Your order will be instantly transmitted to our Shop Billing POS terminal.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Your Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Patel"
                className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              10-Digit Mobile Number * (for bill & pickup SMS/call)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9845012345"
                maxLength={13}
                className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              No OTP needed. Shop staff will contact you when ready.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Preferred Pickup Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                value={pickupSlot}
                onChange={(e) => setPickupSlot(e.target.value)}
                className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 bg-white focus:border-amber-500 focus:outline-none"
              >
                <option value="Ready for pickup in 30–60 mins">Urgent / Within 30–60 mins</option>
                <option value="Today afternoon (2:00 PM – 5:00 PM)">Today afternoon (2:00 PM – 5:00 PM)</option>
                <option value="Today evening (5:00 PM – 8:30 PM)">Today evening (5:00 PM – 8:30 PM)</option>
                <option value="Tomorrow morning (9:00 AM – 12:00 PM)">Tomorrow morning (9:00 AM – 12:00 PM)</option>
                <option value="Flexible / Call me when packed">Flexible / Call me when packed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Delivery / Site Location (optional)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Site #4, Near Water Tank, Gandhi Nagar"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Order Summary Snapshot */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-amber-600" />
              <span>{cart.length} items in order</span>
            </div>
            <div className="font-mono text-sm font-bold text-slate-900">
              Total: {formatMoney(totalPaisa)}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-600 py-3.5 font-bold text-white shadow-lg shadow-amber-600/25 hover:bg-amber-700 active:scale-95 transition disabled:bg-slate-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Transmitting Order to POS...</span>
                </>
              ) : (
                <span>Confirm & Send Order to Shop POS</span>
              )}
            </button>
            <p className="mt-2 text-center text-[11px] text-slate-400">
              You pay only at counter upon pickup via Cash, UPI QR, or Card.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
