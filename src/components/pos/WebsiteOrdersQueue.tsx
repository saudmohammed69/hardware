import React, { useState } from 'react';
import { WebsiteOrder, OrderStatus } from '../../types';
import { formatMoney } from '../../utils/order-logic';
import {
  Bell,
  Volume2,
  VolumeX,
  Phone,
  Clock,
  ArrowRight,
  Receipt,
  CheckCircle2,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';

interface WebsiteOrdersQueueProps {
  orders: WebsiteOrder[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  onSelectOrder: (order: WebsiteOrder) => void;
  onQuickAccept: (orderId: string) => Promise<void>;
  onLoadIntoBilling: (order: WebsiteOrder) => void;
}

export const WebsiteOrdersQueue: React.FC<WebsiteOrdersQueueProps> = ({
  orders,
  soundEnabled,
  onToggleSound,
  onSelectOrder,
  onQuickAccept,
  onLoadIntoBilling,
}) => {
  const [filter, setFilter] = useState<string>('ALL');

  const newOrdersCount = orders.filter((o) => o.status === 'NEW').length;
  const activeOrdersCount = orders.filter((o) =>
    ['NEW', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP'].includes(o.status)
  ).length;

  const filteredOrders = orders.filter((o) => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return ['NEW', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP'].includes(o.status);
    return o.status === filter;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner with Sound & Status Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-slate-900 text-white p-4 shadow-lg border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold">
            <Bell className="h-5 w-5" />
            {newOrdersCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-slate-900 animate-bounce">
                {newOrdersCount}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Live Website Orders Channel</h2>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-xs text-slate-300">
              Orders placed by customers on your website arrive here instantly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSound}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              soundEnabled
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
            title={soundEnabled ? 'Order sound alert is enabled' : 'Order sound alert is muted'}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-amber-400" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span>Sound {soundEnabled ? 'ON' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: 'ALL', label: 'All Orders', count: orders.length },
          { key: 'NEW', label: 'New / Unread', count: newOrdersCount, highlight: newOrdersCount > 0 },
          { key: 'ACTIVE', label: 'In Progress', count: activeOrdersCount },
          { key: 'READY_FOR_PICKUP', label: 'Ready for Counter', count: orders.filter((o) => o.status === 'READY_FOR_PICKUP').length },
          { key: 'COMPLETED', label: 'Completed / Invoiced', count: orders.filter((o) => o.status === 'COMPLETED').length },
        ].map((tab) => {
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                active
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                  tab.highlight
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : active
                    ? 'bg-slate-800 text-slate-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Layers className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-2 text-base font-bold text-slate-800">No orders in this category</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            When customers browse your online catalog and place an order, it will appear here in real time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const isNew = order.status === 'NEW';
            const isCompleted = order.status === 'COMPLETED';
            const checklistCount = order.checklist?.length || 0;

            return (
              <div
                key={order.id}
                className={`relative flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                  isNew
                    ? 'border-amber-400 ring-2 ring-amber-400/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Top Row: Order ID, Status, Time */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded">
                        {order.orderNumber || order.id}
                      </span>
                      {order.unread && (
                        <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-slate-950 animate-pulse">
                          NEW
                        </span>
                      )}
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        order.status === 'NEW'
                          ? 'bg-amber-100 text-amber-900'
                          : order.status === 'ACCEPTED'
                          ? 'bg-blue-100 text-blue-900'
                          : order.status === 'PREPARING'
                          ? 'bg-purple-100 text-purple-900'
                          : order.status === 'READY_FOR_PICKUP'
                          ? 'bg-emerald-100 text-emerald-900'
                          : order.status === 'COMPLETED'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-rose-100 text-rose-900'
                      }`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Customer Information */}
                  <div className="mt-3">
                    <h3 className="text-base font-bold text-slate-900">{order.customer.name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
                      <a
                        href={`tel:${order.customer.phone}`}
                        className="inline-flex items-center gap-1 font-mono font-semibold text-amber-700 hover:underline"
                      >
                        <Phone className="h-3 w-3" />
                        <span>+91 {order.customer.phone}</span>
                      </a>
                      <span>•</span>
                      <span className="text-slate-400 inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{order.customer.pickupPreference || 'Standard Pickup'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Items Summary Preview */}
                  <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-700 border border-slate-100">
                    <div className="font-semibold text-slate-900 mb-1 flex items-center justify-between">
                      <span>Items ({order.items.length})</span>
                      {checklistCount > 0 && (
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          {checklistCount}/{order.items.length} packed
                        </span>
                      )}
                    </div>
                    <ul className="space-y-1">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex justify-between text-slate-600">
                          <span className="truncate pr-2">
                            • {item.name} ({item.size})
                            {item.isPipe && (
                              <span className="text-amber-800 font-semibold ml-1">
                                [{item.fullLengths}L + {item.extraFeet}ft]
                              </span>
                            )}
                          </span>
                          <span className="font-mono font-medium text-slate-800 shrink-0">
                            {formatMoney(item.lineTotalPaisa)}
                          </span>
                        </li>
                      ))}
                      {order.items.length > 3 && (
                        <li className="text-[11px] text-slate-400 italic">
                          +{order.items.length - 3} more items...
                        </li>
                      )}
                    </ul>

                    {order.orderNote && (
                      <p className="mt-2 text-[11px] text-amber-900 bg-amber-100/60 p-1.5 rounded font-medium truncate">
                        Note: {order.orderNote}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Total & Action Buttons */}
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-500">Order Total</span>
                    <span className="font-mono text-base font-extrabold text-slate-900">
                      {formatMoney(order.totalPaisa)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectOrder(order)}
                      className="flex-1 rounded-xl border border-slate-300 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                      View & Pack
                    </button>

                    {isNew ? (
                      <button
                        onClick={() => onQuickAccept(order.id)}
                        className="flex-1 rounded-xl bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
                      >
                        Accept
                      </button>
                    ) : !isCompleted ? (
                      <button
                        onClick={() => onLoadIntoBilling(order)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 py-2 text-xs font-bold text-white hover:bg-amber-700 transition shadow-sm"
                        title="Load this website order straight into your POS bill register"
                      >
                        <Receipt className="h-3.5 w-3.5" />
                        <span>Load into Bill</span>
                      </button>
                    ) : (
                      <div className="flex-1 text-center py-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl">
                        ✓ Billed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
