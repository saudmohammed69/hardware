import React, { useState, useEffect, useRef } from 'react';
import {
  AppMode,
  Header,
} from './components/Header';
import { Storefront } from './components/customer/Storefront';
import { CartDrawer } from './components/customer/CartDrawer';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { OrderTrackerModal } from './components/customer/OrderTrackerModal';
import { POSBillingApp } from './components/pos/POSBillingApp';
import { AndroidBridgeGuide } from './components/integration/AndroidBridgeGuide';
import { ApkDeployCenter } from './components/integration/ApkDeployCenter';
import { CounterQrModal } from './components/common/CounterQrModal';
import {
  CartLineItem,
  CompletedBill,
  OrderStatus,
  ShopSettings,
  WebsiteOrder,
} from './types';
import { playOrderChime } from './utils/sound';
import { Bell, CheckCircle, X, Sparkles } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<AppMode>('SPLIT');
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [orders, setOrders] = useState<WebsiteOrder[]>([]);
  const [completedBills, setCompletedBills] = useState<CompletedBill[]>([]);
  const [settings, setSettings] = useState<ShopSettings>({
    shopName: 'HardwareShop POS & Electricals',
    shopPhone: '+91 98450 00000',
    shopAddress: 'Main Road, Hardware Bazaar, Opposite Metro Pillar #124',
    gstin: '29ABCDE1234F1Z5',
    upiId: 'hardwareshop@upi',
    upiPayeeName: 'Hardware Shop POS',
    openTime: '09:00',
    closeTime: '21:00',
    onlineOrderingActive: true,
  });

  // Customer Cart & Checkout State
  const [cart, setCart] = useState<CartLineItem[]>([
    {
      productId: 'demo-pvc-0',
      name: 'Supreme CPVC Pressure Pipe',
      size: '3/4 inch',
      unit: 'Length',
      unitPricePaisa: 26000,
      quantity: 2,
      isPipe: true,
      fullLengths: 2,
      extraFeet: 4,
      lineTotalPaisa: 62000, // 2 * 26000 + 4 * 2500 = 52000 + 10000 = 62000
    },
  ]);
  const [orderNote, setOrderNote] = useState<string>('');
  const [missingRequest, setMissingRequest] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [trackedOrder, setTrackedOrder] = useState<WebsiteOrder | null>(null);

  // Sound and Toast Alerts
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [newOrderToast, setNewOrderToast] = useState<WebsiteOrder | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Safe fetch helper that never crashes or throws unhandled errors
  const safeFetch = async <T,>(url: string, defaultValue: T): Promise<T> => {
    try {
      const res = await fetch(url);
      if (!res.ok) return defaultValue;
      return (await res.json()) as T;
    } catch {
      return defaultValue;
    }
  };

  // Fetch initial orders, bills, and settings
  const fetchAllData = async () => {
    const [ordersData, billsData, settingsData] = await Promise.all([
      safeFetch<WebsiteOrder[]>('/api/orders', []),
      safeFetch<CompletedBill[]>('/api/pos/bills', []),
      safeFetch<ShopSettings | null>('/api/settings', null),
    ]);

    if (ordersData.length > 0) {
      setOrders(ordersData);
    }
    if (billsData.length > 0) {
      setCompletedBills(billsData);
    }
    if (settingsData) {
      setSettings(settingsData);
    }
  };

  useEffect(() => {
    fetchAllData();

    // Setup Server-Sent Events (SSE) for Real-Time Order Stream
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/stream');

      eventSource.addEventListener('new_order', (e) => {
        try {
          const newOrder: WebsiteOrder = JSON.parse(e.data);
          setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);

          if (soundEnabled) {
            playOrderChime();
          }

          // Trigger toast
          setNewOrderToast(newOrder);
          if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
          toastTimeoutRef.current = setTimeout(() => {
            setNewOrderToast(null);
          }, 6000);
        } catch (err) {
          console.error('Error parsing SSE new_order:', err);
        }
      });

      eventSource.addEventListener('order_updated', (e) => {
        try {
          const updated: WebsiteOrder = JSON.parse(e.data);
          setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
          setTrackedOrder((curr) => (curr && curr.id === updated.id ? updated : curr));
        } catch (err) {
          console.error('Error parsing SSE order_updated:', err);
        }
      });
    } catch (err) {
      console.warn('SSE connection warning:', err);
    }

    // Backup polling every 4 seconds in case SSE drops
    const pollInterval = setInterval(fetchAllData, 4000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(pollInterval);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [soundEnabled]);

  // Cart operations
  const handleAddToCart = (newItem: CartLineItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.productId === newItem.productId);
      if (existingIndex !== -1 && !newItem.isPipe) {
        const clone = [...prev];
        const prevItem = clone[existingIndex];
        const newQty = prevItem.quantity + newItem.quantity;
        clone[existingIndex] = {
          ...prevItem,
          quantity: newQty,
          lineTotalPaisa: newQty * prevItem.unitPricePaisa,
        };
        return clone;
      }
      return [...prev, newItem];
    });
  };

  const handleUpdateQuantity = (productId: string, newQty: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          return {
            ...item,
            quantity: newQty,
            lineTotalPaisa: newQty * item.unitPricePaisa,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  // Order submission from customer
  const handleOrderSubmitted = (order: WebsiteOrder) => {
    setCart([]);
    setOrderNote('');
    setMissingRequest('');
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setTrackedOrder(order);
  };

  // Status transitions
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, reason?: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === data.order.id ? data.order : o)));
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  // Packing checklist toggle
  const handleToggleChecklist = async (orderId: string, productId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const currentList = new Set(targetOrder.checklist || []);
    if (currentList.has(productId)) {
      currentList.delete(productId);
    } else {
      currentList.add(productId);
    }

    const updatedChecklist = Array.from(currentList);
    try {
      await fetch(`/api/orders/${orderId}/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklist: updatedChecklist }),
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, checklist: updatedChecklist } : o))
      );
    } catch (err) {
      console.error('Failed to toggle checklist', err);
    }
  };

  // Save finalized bill
  const handleSaveCompletedBill = async (bill: CompletedBill) => {
    try {
      const res = await fetch('/api/pos/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bill),
      });
      if (res.ok) {
        const data = await res.json();
        setCompletedBills((prev) => [data.bill, ...prev]);
        fetchAllData();
      }
    } catch (err) {
      console.error('Failed to save bill', err);
    }
  };

  // Update shop settings
  const handleUpdateSettings = async (newSettings: ShopSettings) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        setSettings(newSettings);
      }
    } catch (err) {
      console.error('Failed to save settings', err);
    }
  };

  // Simulator helper: triggers a live website order to show real-time arrival
  const handleTriggerDemoOrder = async () => {
    const names = ['Vikram Singh', 'Manoj Gowda', 'Suresh Reddy', 'Farhan Akhtar', 'Deepak Verma'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;

    const demoItems: CartLineItem[] = [
      {
        productId: 'demo-pvc-1',
        name: 'PVC Pipe 3/4 inch',
        size: '3/4 inch',
        unit: 'Length',
        unitPricePaisa: 26000,
        quantity: 2,
        isPipe: true,
        fullLengths: 2,
        extraFeet: 5,
        lineTotalPaisa: 64500,
      },
      {
        productId: 'demo-cement',
        name: 'UltraTech Cement 50kg Bag',
        size: '50kg',
        unit: 'Bag',
        unitPricePaisa: 39000,
        quantity: 1,
        lineTotalPaisa: 39000,
      },
      {
        productId: 'demo-screw',
        name: 'Wood Screws 1 inch',
        size: '1 inch',
        unit: 'Box',
        unitPricePaisa: 8500,
        quantity: 2,
        lineTotalPaisa: 17000,
      },
    ];

    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: {
          name: randomName,
          phone: randomPhone,
          pickupPreference: 'Counter Pickup in 30 mins',
        },
        items: demoItems,
        orderNote: 'Urgent plumbing requirement, please pack ready for counter pickup.',
      }),
    });
  };

  const newOrdersCount = orders.filter((o) => o.status === 'NEW').length;
  const cartItemCount = cart.reduce((acc, i) => acc + (i.quantity || 1), 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        mode={mode}
        setMode={setMode}
        newOrdersCount={newOrdersCount}
        cartCount={cartItemCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenQrModal={() => setIsQrModalOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          setSoundEnabled(!soundEnabled);
          if (!soundEnabled) playOrderChime();
        }}
      />

      {/* Real-time Order Arrival Banner / Toast */}
      {newOrderToast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm rounded-2xl bg-amber-500 text-slate-950 p-4 shadow-2xl border-2 border-slate-900 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <div className="p-1 bg-slate-950 text-white rounded-lg">
                <Bell className="h-4 w-4 animate-bounce" />
              </div>
              <div>
                <div className="font-mono text-xs font-black uppercase tracking-wider">
                  Ding! New Web Order {newOrderToast.id}
                </div>
                <div className="font-bold text-sm text-slate-950">
                  {newOrderToast.customer.name} placed an order!
                </div>
                <p className="text-xs text-amber-950 mt-0.5">
                  {newOrderToast.items.length} items ready for billing review.
                </p>
              </div>
            </div>
            <button
              onClick={() => setNewOrderToast(null)}
              className="text-slate-900 hover:text-black p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => {
              setNewOrderToast(null);
              setMode('POS');
            }}
            className="mt-2.5 w-full rounded-xl bg-slate-950 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition"
          >
            Open in Billing App
          </button>
        </div>
      )}

      {/* Main Content Areas based on Mode */}
      <main className="flex-1">
        {mode === 'STOREFRONT' && (
          <Storefront
            cart={cart}
            onOpenCart={() => setIsCartOpen(true)}
            onAddToCart={handleAddToCart}
          />
        )}

        {mode === 'POS' && (
          <POSBillingApp
            orders={orders}
            completedBills={completedBills}
            settings={settings}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onToggleChecklist={handleToggleChecklist}
            onSaveCompletedBill={handleSaveCompletedBill}
            onUpdateSettings={handleUpdateSettings}
            onTriggerDemoOrder={handleTriggerDemoOrder}
          />
        )}

        {mode === 'SPLIT' && (
          <div className="flex flex-col xl:flex-row min-h-[calc(100vh-65px)]">
            {/* Left: Customer Storefront */}
            <div className="xl:w-1/2 border-r border-slate-200 overflow-y-auto">
              <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-extrabold flex items-center justify-between border-b border-amber-600">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>CUSTOMER VIEW: Online Hardware Store</span>
                </span>
                <span className="text-[11px] font-medium opacity-90">
                  Place an order here to see it arrive on the right!
                </span>
              </div>
              <Storefront
                cart={cart}
                onOpenCart={() => setIsCartOpen(true)}
                onAddToCart={handleAddToCart}
              />
            </div>

            {/* Right: Merchant POS Billing Station */}
            <div className="xl:w-1/2 overflow-y-auto bg-slate-100/60">
              <div className="bg-slate-950 text-white px-4 py-2 text-xs font-extrabold flex items-center justify-between border-b border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Bell className="h-3.5 w-3.5 text-amber-400" />
                  <span>SHOP COUNTER VIEW: HardwareShopPOS Billing App</span>
                </span>
                <span className="text-emerald-400 text-[11px] font-bold">
                  ● Real-time Live Receiver Active
                </span>
              </div>
              <POSBillingApp
                orders={orders}
                completedBills={completedBills}
                settings={settings}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled(!soundEnabled)}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onToggleChecklist={handleToggleChecklist}
                onSaveCompletedBill={handleSaveCompletedBill}
                onUpdateSettings={handleUpdateSettings}
                onTriggerDemoOrder={handleTriggerDemoOrder}
              />
            </div>
          </div>
        )}

        {mode === 'GUIDE' && (
          <AndroidBridgeGuide onTriggerDemoOrder={handleTriggerDemoOrder} />
        )}

        {mode === 'APK_DEPLOY' && (
          <ApkDeployCenter
            onTriggerDemoOrder={handleTriggerDemoOrder}
            onGoToStorefront={() => setMode('STOREFRONT')}
            onGoToPOS={() => setMode('POS')}
          />
        )}
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          orderNote={orderNote}
          setOrderNote={setOrderNote}
          missingRequest={missingRequest}
          setMissingRequest={setMissingRequest}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onProceedToCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
        />
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cart={cart}
          orderNote={orderNote}
          missingRequest={missingRequest}
          onOrderSubmitted={handleOrderSubmitted}
        />
      )}

      {/* Order Tracker Modal */}
      {trackedOrder && (
        <OrderTrackerModal
          order={trackedOrder}
          onClose={() => setTrackedOrder(null)}
          onOrderCancelled={() => setTrackedOrder(null)}
        />
      )}

      {/* Counter QR Standee & 5-Step Journey Modal */}
      {isQrModalOpen && (
        <CounterQrModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          onSimulateScan={() => {
            setMode('STOREFRONT');
          }}
        />
      )}
    </div>
  );
}
