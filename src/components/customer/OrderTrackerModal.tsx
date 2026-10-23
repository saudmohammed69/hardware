import React, { useState, useEffect } from 'react';
import { WebsiteOrder, OrderStatus } from '../../types';
import { formatMoney } from '../../utils/order-logic';
import {
  X,
  CheckCircle2,
  Clock,
  Package,
  Store,
  PhoneCall,
  Check,
  AlertTriangle,
  Receipt,
} from 'lucide-react';

interface OrderTrackerModalProps {
  order: WebsiteOrder | null;
  onClose: () => void;
  onOrderCancelled?: (orderId: string) => void;
}

const statusSteps: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'NEW', label: 'Order Sent', desc: 'Waiting for shop counter confirmation' },
  { key: 'ACCEPTED', label: 'Confirmed', desc: 'Staff accepted your order' },
  { key: 'PREPARING', label: 'Packing Items', desc: 'Cutting pipes and gathering hardware' },
  { key: 'READY_FOR_PICKUP', label: 'Ready at Counter', desc: 'Ready for you to collect and pay' },
  { key: 'COMPLETED', label: 'Billed & Collected', desc: 'Invoice generated and paid' },
];

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  order: initialOrder,
  onClose,
  onOrderCancelled,
}) => {
  const [order, setOrder] = useState<WebsiteOrder | null>(initialOrder);
  const [cancelling, setCancelling] = useState<boolean>(false);

  // Poll for real-time order status changes
  useEffect(() => {
    if (!initialOrder) return;
    setOrder(initialOrder);

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${initialOrder.id}`);
        if (res.ok) {
          const updated = await res.json();
          setOrder(updated);
        }
      } catch (err) {
        console.error('Failed to poll order status', err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [initialOrder]);

  if (!order) return null;

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED', reason: 'Customer requested cancellation' }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
        onOrderCancelled?.(order.id);
      }
    } catch (e) {
      alert('Could not cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const getStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'NEW':
        return 0;
      case 'ACCEPTED':
        return 1;
      case 'PREPARING':
        return 2;
      case 'READY_FOR_PICKUP':
        return 3;
      case 'BILLING_IN_PROGRESS':
        return 3;
      case 'COMPLETED':
        return 4;
      default:
        return 0;
    }
  };

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close tracking"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-500 text-slate-950 font-mono text-xs font-black px-2 py-0.5">
              {order.orderNumber || order.id}
            </span>
            <span className="text-xs text-slate-500">Live Pickup Order</span>
          </div>
          <h2 className="mt-1 text-xl font-extrabold text-slate-900">
            {order.customer.name}
          </h2>
          <p className="text-xs text-slate-500">
            {order.customer.phone} · {order.customer.pickupPreference || 'Standard Pickup'}
          </p>
        </div>

        {/* Cancellation Notice if cancelled */}
        {isCancelled ? (
          <div className="my-6 rounded-xl bg-rose-50 border border-rose-200 p-4 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-rose-600 mb-2" />
            <h3 className="font-bold text-rose-900 text-sm">Order Cancelled</h3>
            <p className="text-xs text-rose-700 mt-1">
              {order.cancellationReason || 'This order was cancelled.'}
            </p>
          </div>
        ) : (
          /* Live Progress Steps */
          <div className="my-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Order Status Timeline
            </h4>
            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {statusSteps.map((step, idx) => {
                const isPassed = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={step.key} className="relative flex items-start gap-3">
                    <div
                      className={`absolute -left-6 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                        isPassed
                          ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-100'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isPassed ? <Check className="h-3 w-3" /> : idx + 1}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold ${
                            isCurrent
                              ? 'text-amber-600'
                              : isPassed
                              ? 'text-slate-900'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                        {isCurrent && (
                          <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Items Summary */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">Order Items ({order.items.length})</span>
            <span className="font-mono text-sm font-black text-slate-900">
              {formatMoney(order.totalPaisa)}
            </span>
          </div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto text-xs text-slate-600 divide-y divide-slate-200/50">
            {order.items.map((item, idx) => (
              <div key={idx} className="pt-1.5 flex justify-between items-center">
                <div>
                  <span className="font-medium text-slate-900">{item.name}</span>
                  <span className="text-slate-400 ml-1">({item.size})</span>
                  {item.isPipe && (
                    <span className="ml-1 text-[11px] text-amber-700 font-medium">
                      [{item.fullLengths}L + {item.extraFeet}ft]
                    </span>
                  )}
                </div>
                <div className="font-mono text-slate-800">
                  {formatMoney(item.lineTotalPaisa)}
                </div>
              </div>
            ))}
          </div>

          {order.billedBillId && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-100 p-2.5 text-xs font-bold text-emerald-800 border border-emerald-200">
              <Receipt className="h-4 w-4" />
              <span>Billed as Invoice #{order.billedBillId}</span>
            </div>
          )}
        </div>

        {/* Shop Contact & Action */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <a
            href="tel:+919845000000"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <PhoneCall className="h-3.5 w-3.5 text-amber-600" />
            <span>Call Shop Counter</span>
          </a>

          {!isCancelled && order.status === 'NEW' && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}

          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
