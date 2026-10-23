import React, { useState } from 'react';
import { CompletedBill, OrderStatus, ShopSettings, WebsiteOrder, CartLineItem } from '../../types';
import { WebsiteOrdersQueue } from './WebsiteOrdersQueue';
import { OrderDetailModal } from './OrderDetailModal';
import { BillingCounter } from './BillingCounter';
import { ThermalReceiptModal } from './ThermalReceiptModal';
import { formatMoney } from '../../utils/order-logic';
import {
  Bell,
  Receipt,
  FileText,
  Settings,
  Sparkles,
  Printer,
  Calendar,
  CheckCircle,
} from 'lucide-react';

interface POSBillingAppProps {
  orders: WebsiteOrder[];
  completedBills: CompletedBill[];
  settings: ShopSettings;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, reason?: string) => Promise<void>;
  onToggleChecklist: (orderId: string, productId: string) => Promise<void>;
  onSaveCompletedBill: (bill: CompletedBill) => Promise<void>;
  onUpdateSettings: (settings: ShopSettings) => Promise<void>;
  onTriggerDemoOrder?: () => Promise<void>;
}

export const POSBillingApp: React.FC<POSBillingAppProps> = ({
  orders,
  completedBills,
  settings,
  soundEnabled,
  onToggleSound,
  onUpdateOrderStatus,
  onToggleChecklist,
  onSaveCompletedBill,
  onUpdateSettings,
  onTriggerDemoOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'BILLING' | 'BILLS' | 'SETTINGS'>('ORDERS');
  const [selectedOrder, setSelectedOrder] = useState<WebsiteOrder | null>(null);

  // Billing Counter State
  const [billingCart, setBillingCart] = useState<CartLineItem[]>([]);
  const [sourceOrder, setSourceOrder] = useState<WebsiteOrder | null>(null);
  const [billedCustomerName, setBilledCustomerName] = useState<string>('');
  const [billedCustomerPhone, setBilledCustomerPhone] = useState<string>('');

  // Thermal Receipt Modal
  const [activeReceiptBill, setActiveReceiptBill] = useState<CompletedBill | null>(null);

  const newOrdersCount = orders.filter((o) => o.status === 'NEW').length;

  // The critical feature: Loading website order straight into billing!
  const handleLoadIntoBilling = (order: WebsiteOrder) => {
    setBillingCart([...order.items]);
    setSourceOrder(order);
    setBilledCustomerName(order.customer.name);
    setBilledCustomerPhone(order.customer.phone);
    setActiveTab('BILLING');
  };

  const handleFinalizeBill = async (bill: CompletedBill) => {
    await onSaveCompletedBill(bill);
    setActiveReceiptBill(bill);
    setBillingCart([]);
    setSourceOrder(null);
    setBilledCustomerName('');
    setBilledCustomerPhone('');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 p-4 sm:p-6 pb-20">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Top POS Terminal Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900">
                {settings.shopName}
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                POS Station Online
              </span>
            </div>
            <p className="text-xs text-slate-500">
              GSTIN: {settings.gstin} · Counter Terminal #01
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onTriggerDemoOrder && (
              <button
                onClick={onTriggerDemoOrder}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 px-3 py-2 text-xs font-bold text-amber-900 border border-amber-300 hover:bg-amber-200 transition"
                title="Simulate a customer placing an order online right now"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-700" />
                <span>Simulate Web Order</span>
              </button>
            )}

            {/* Sub-tabs */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
              <button
                onClick={() => setActiveTab('ORDERS')}
                className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                  activeTab === 'ORDERS'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bell className="h-3.5 w-3.5" />
                <span>Web Orders</span>
                {newOrdersCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-mono font-black text-slate-950 animate-bounce">
                    {newOrdersCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('BILLING')}
                className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                  activeTab === 'BILLING'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Receipt className="h-3.5 w-3.5" />
                <span>Billing Register</span>
                {billingCart.length > 0 && (
                  <span className="flex h-2 w-2 rounded-full bg-amber-500"></span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('BILLS')}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                  activeTab === 'BILLS'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Bill History</span>
              </button>

              <button
                onClick={() => setActiveTab('SETTINGS')}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                  activeTab === 'SETTINGS'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Settings className="h-3.5 w-3.5" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Live Web Orders Queue */}
        {activeTab === 'ORDERS' && (
          <WebsiteOrdersQueue
            orders={orders}
            soundEnabled={soundEnabled}
            onToggleSound={onToggleSound}
            onSelectOrder={(order) => setSelectedOrder(order)}
            onQuickAccept={(orderId) => onUpdateOrderStatus(orderId, 'ACCEPTED')}
            onLoadIntoBilling={handleLoadIntoBilling}
          />
        )}

        {/* Tab 2: Billing Counter */}
        {activeTab === 'BILLING' && (
          <BillingCounter
            cart={billingCart}
            sourceOrder={sourceOrder}
            customerName={billedCustomerName}
            customerPhone={billedCustomerPhone}
            settings={settings}
            onUpdateCart={setBillingCart}
            onClearBill={() => {
              setBillingCart([]);
              setSourceOrder(null);
              setBilledCustomerName('');
              setBilledCustomerPhone('');
            }}
            onFinalizeBill={handleFinalizeBill}
          />
        )}

        {/* Tab 3: Completed Bill Invoices */}
        {activeTab === 'BILLS' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Completed Bill Invoices</h3>
                <p className="text-xs text-slate-500">
                  Recorded sales and thermal receipts generated from the billing register
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {completedBills.length} Invoices
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {completedBills.map((bill) => (
                <div key={bill.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">{bill.id}</span>
                      {bill.orderId && (
                        <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                          Web Ref: {bill.orderId}
                        </span>
                      )}
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {bill.paymentMode}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      <span>{bill.customerName}</span>
                      {bill.customerPhone && <span className="ml-1 font-mono">({bill.customerPhone})</span>}
                      <span className="mx-1">•</span>
                      <span>{new Date(bill.createdAt).toLocaleDateString()} at {new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-mono text-base font-extrabold text-slate-900">
                        {formatMoney(bill.finalTotalPaisa)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {bill.items.length} items
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveReceiptBill(bill)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      title="Print or view thermal invoice"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Shop Settings */}
        {activeTab === 'SETTINGS' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 max-w-2xl">
            <h3 className="text-base font-bold text-slate-900">Store & Billing Configuration</h3>
            <p className="text-xs text-slate-500">
              Shop details printed on thermal receipts and displayed on the website catalog.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Shop Name</label>
                <input
                  type="text"
                  value={settings.shopName}
                  onChange={(e) => onUpdateSettings({ ...settings, shopName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={settings.shopPhone}
                  onChange={(e) => onUpdateSettings({ ...settings, shopPhone: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Address</label>
                <input
                  type="text"
                  value={settings.shopAddress}
                  onChange={(e) => onUpdateSettings({ ...settings, shopAddress: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={settings.gstin}
                    onChange={(e) => onUpdateSettings({ ...settings, gstin: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">UPI ID (for QR payment)</label>
                  <input
                    type="text"
                    value={settings.upiId}
                    onChange={(e) => onUpdateSettings({ ...settings, upiId: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail & Checklist Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={onUpdateOrderStatus}
          onToggleChecklist={onToggleChecklist}
          onLoadIntoBilling={handleLoadIntoBilling}
        />
      )}

      {/* Thermal Receipt Preview Modal */}
      {activeReceiptBill && (
        <ThermalReceiptModal
          bill={activeReceiptBill}
          settings={settings}
          onClose={() => setActiveReceiptBill(null)}
        />
      )}
    </div>
  );
};
