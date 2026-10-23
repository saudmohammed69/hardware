import React, { useState } from 'react';
import { WebsiteOrder, OrderStatus } from '../../types';
import { formatMoney } from '../../utils/order-logic';
import {
  X,
  Phone,
  Clock,
  CheckSquare,
  Square,
  ArrowRight,
  PackageCheck,
  Receipt,
  AlertTriangle,
  Send,
} from 'lucide-react';

interface OrderDetailModalProps {
  order: WebsiteOrder | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus, reason?: string) => Promise<void>;
  onToggleChecklist: (orderId: string, productId: string) => Promise<void>;
  onLoadIntoBilling: (order: WebsiteOrder) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onUpdateStatus,
  onToggleChecklist,
  onLoadIntoBilling,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [showCancelInput, setShowCancelInput] = useState<boolean>(false);

  if (!order) return null;

  const checklistSet = new Set(order.checklist || []);
  const allPacked = order.items.length > 0 && order.items.every((it) => checklistSet.has(it.productId));

  const handleAction = async (status: OrderStatus) => {
    setLoading(true);
    try {
      await onUpdateStatus(order.id, status, status === 'CANCELLED' ? cancelReason : undefined);
      if (status === 'CANCELLED') {
        setShowCancelInput(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-500 text-slate-950 font-mono text-xs font-black px-2.5 py-1">
              {order.id}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                order.status === 'NEW'
                  ? 'bg-amber-100 text-amber-800 animate-pulse'
                  : order.status === 'ACCEPTED'
                  ? 'bg-blue-100 text-blue-800'
                  : order.status === 'PREPARING'
                  ? 'bg-purple-100 text-purple-800'
                  : order.status === 'READY_FOR_PICKUP'
                  ? 'bg-emerald-100 text-emerald-800'
                  : order.status === 'COMPLETED'
                  ? 'bg-slate-100 text-slate-700'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {order.status.replace(/_/g, ' ')}
            </span>
            <span className="text-xs text-slate-400 ml-auto">
              Received {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="mt-3 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{order.customer.name}</h2>
              <div className="mt-1 flex items-center gap-3 text-xs text-slate-600">
                <a
                  href={`tel:${order.customer.phone}`}
                  className="inline-flex items-center gap-1 font-mono font-semibold text-amber-700 hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>+91 {order.customer.phone}</span>
                </a>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{order.customer.pickupPreference || 'Standard Pickup'}</span>
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400">Order Estimate</span>
              <div className="font-mono text-xl font-black text-slate-900">
                {formatMoney(order.totalPaisa)}
              </div>
            </div>
          </div>

          {order.customer.address && (
            <p className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
              <strong>Site/Address:</strong> {order.customer.address}
            </p>
          )}

          {order.orderNote && (
            <div className="mt-2 text-xs text-amber-900 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200">
              <strong>Customer Note:</strong> {order.orderNote}
            </div>
          )}

          {order.missingItemRequest && (
            <div className="mt-2 text-xs text-indigo-900 bg-indigo-50 p-2.5 rounded-lg border border-indigo-200">
              <strong>Special Item Requested:</strong> {order.missingItemRequest}
            </div>
          )}
        </div>

        {/* Packing Checklist */}
        <div className="py-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Order Items & Packing Checklist ({checklistSet.size}/{order.items.length})
            </h3>
            <span className="text-[11px] text-slate-400">
              Check off items as you pull them from shelf
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {order.items.map((item) => {
              const isChecked = checklistSet.has(item.productId);
              return (
                <div
                  key={item.productId}
                  onClick={() => onToggleChecklist(order.id, item.productId)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                    isChecked
                      ? 'border-emerald-200 bg-emerald-50/60 text-slate-700'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button type="button" className="text-emerald-600 focus:outline-none">
                      {isChecked ? (
                        <CheckSquare className="h-5 w-5 fill-emerald-100" />
                      ) : (
                        <Square className="h-5 w-5 text-slate-300" />
                      )}
                    </button>
                    <div>
                      <div className={`text-sm font-bold ${isChecked ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {item.size} {item.unit && `· ${item.unit}`}
                        {item.isPipe && (
                          <span className="ml-1 text-amber-800 font-semibold">
                            ({item.fullLengths} Full Lengths + {item.extraFeet} ft cut)
                          </span>
                        )}
                        {item.note && (
                          <span className="ml-1 text-amber-600 italic">"{item.note}"</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {formatMoney(item.lineTotalPaisa)}
                    </span>
                    <div className="text-[11px] text-slate-400">
                      Qty: {item.isPipe ? item.fullLengths : item.quantity}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* POS Action Buttons */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          {/* Main Key Feature: Load into Billing */}
          <div className="rounded-xl bg-amber-50 p-3.5 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-amber-950 uppercase">Ready to Invoice?</h4>
              <p className="text-[11px] text-amber-800">
                Import these items directly into the POS billing register to calculate GST, discount, and collect payment.
              </p>
            </div>
            <button
              onClick={() => {
                onLoadIntoBilling(order);
                onClose();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-amber-700 active:scale-95 transition whitespace-nowrap"
            >
              <Receipt className="h-4 w-4" />
              <span>Load into Billing</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Status Transitions */}
          <div className="flex flex-wrap items-center gap-2">
            {order.status === 'NEW' && (
              <button
                disabled={loading}
                onClick={() => handleAction('ACCEPTED')}
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                Accept Order
              </button>
            )}

            {(order.status === 'NEW' || order.status === 'ACCEPTED') && (
              <button
                disabled={loading}
                onClick={() => handleAction('PREPARING')}
                className="flex-1 rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-700 transition flex items-center justify-center gap-1.5"
              >
                <PackageCheck className="h-4 w-4" />
                <span>Start Packing</span>
              </button>
            )}

            {(order.status === 'ACCEPTED' || order.status === 'PREPARING') && (
              <button
                disabled={loading}
                onClick={() => handleAction('READY_FOR_PICKUP')}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                Mark Ready for Pickup
              </button>
            )}

            {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
              <button
                disabled={loading}
                onClick={() => setShowCancelInput(!showCancelInput)}
                className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
              >
                Reject / Cancel
              </button>
            )}
          </div>

          {/* Cancellation Input */}
          {showCancelInput && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 space-y-2">
              <label className="block text-xs font-bold text-rose-900">
                Reason for cancellation (will be visible to customer):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Stock unavailable, please call shop"
                  className="flex-1 rounded-lg border border-rose-300 px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                />
                <button
                  onClick={() => handleAction('CANCELLED')}
                  disabled={!cancelReason.trim() || loading}
                  className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
