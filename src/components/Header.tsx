import React from 'react';
import {
  ShoppingBag,
  Store,
  Phone,
  Clock,
  QrCode,
  ShieldCheck,
  Smartphone,
  Receipt,
  Columns,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Download,
} from 'lucide-react';
import { formatMoney } from '../utils/order-logic';

export type AppMode = 'STOREFRONT' | 'POS' | 'SPLIT' | 'GUIDE' | 'APK_DEPLOY';

interface HeaderProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isStaffMode: boolean;
  setIsStaffMode: (val: boolean) => void;
  shopName: string;
  shopPhone: string;
  cartCount: number;
  cartTotalPaisa: number;
  onOpenCart: () => void;
  onOpenQrModal: () => void;
  activeOrderNumber?: string | null;
  onTrackOrder?: () => void;
  newOrdersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  setMode,
  isStaffMode,
  setIsStaffMode,
  shopName,
  shopPhone,
  cartCount,
  cartTotalPaisa,
  onOpenCart,
  onOpenQrModal,
  activeOrderNumber,
  onTrackOrder,
  newOrdersCount,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      {/* Top Notice Bar for Customer */}
      <div className="bg-slate-900 text-slate-200 text-[11px] sm:text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <Clock className="h-3.5 w-3.5" />
              <span>Open 9:00 AM – 9:00 PM</span>
            </span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="hidden sm:inline text-slate-300">
              ⚡ Order online & collect packed items at counter in 5 mins
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={`tel:${shopPhone.replace(/\s+/g, '')}`}
              className="flex items-center gap-1 font-bold text-amber-400 hover:text-amber-300 transition"
            >
              <Phone className="h-3 w-3" />
              <span>{shopPhone}</span>
            </a>

            {/* Discreet Staff & POS Toggle */}
            <button
              onClick={() => setIsStaffMode(!isStaffMode)}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white transition px-2 py-0.5 rounded bg-slate-800"
              title="Toggle Shop Staff & Android POS Connection Bar"
            >
              <SlidersHorizontal className="h-3 w-3" />
              <span className="hidden sm:inline">
                {isStaffMode ? 'Hide Staff Bar' : 'Staff / POS Bridge'}
              </span>
              {newOrdersCount > 0 && (
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-slate-950">
                  {newOrdersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Customer Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand & Storefront Tagline */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setMode('STOREFRONT')}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-950">
                {shopName}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span>Counter Pickup Active</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Browse 1,478 hardware items · Pipes, plumbing, paint & tools
            </p>
          </div>
        </div>

        {/* Customer Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Order Tracker Button (if customer placed an order) */}
          {activeOrderNumber && onTrackOrder && (
            <button
              onClick={onTrackOrder}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-300 text-amber-950 px-3 py-2 text-xs font-extrabold transition animate-pulse"
            >
              <span>Track Order {activeOrderNumber}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Counter QR Standee Button */}
          <button
            onClick={onOpenQrModal}
            className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 text-xs font-bold transition"
            title="View Shop Counter QR Code"
          >
            <QrCode className="h-4 w-4 text-amber-700" />
            <span className="hidden md:inline">Counter QR</span>
          </button>

          {/* Customer Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white px-4 py-2.5 shadow-md shadow-slate-950/20 transition active:scale-95"
            aria-label="Open cart"
          >
            <div className="relative">
              <ShoppingBag className="h-5 w-5 text-amber-400" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-mono font-black text-slate-950 animate-bounce">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider leading-none">
                My Cart
              </div>
              <div className="text-xs font-extrabold text-amber-400 leading-tight">
                {cartCount > 0 ? formatMoney(cartTotalPaisa) : 'Empty'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Staff / Owner Toolbar (Only shown when toggled on by shop owner) */}
      {isStaffMode && (
        <div className="bg-amber-50 border-t border-amber-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-amber-950 flex items-center gap-1">
                <Smartphone className="h-4 w-4 text-amber-700" />
                <span>Shop Staff & Android POS Bridge:</span>
              </span>
              <span className="text-slate-600 hidden md:inline">
                Customer orders automatically push to your Android POS app
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setMode('STOREFRONT')}
                className={`rounded-lg px-2.5 py-1 font-bold transition ${
                  mode === 'STOREFRONT'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                Customer Website Only
              </button>

              <button
                onClick={() => setMode('POS')}
                className={`rounded-lg px-2.5 py-1 font-bold transition flex items-center gap-1 ${
                  mode === 'POS'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <Receipt className="h-3.5 w-3.5" />
                <span>Billing App (POS)</span>
                {newOrdersCount > 0 && (
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-slate-950">
                    {newOrdersCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMode('SPLIT')}
                className={`rounded-lg px-2.5 py-1 font-bold transition flex items-center gap-1 ${
                  mode === 'SPLIT'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <Columns className="h-3.5 w-3.5" />
                <span>Side-by-Side</span>
              </button>

              <button
                onClick={() => setMode('APK_DEPLOY')}
                className={`rounded-lg px-2.5 py-1 font-bold transition flex items-center gap-1 ${
                  mode === 'APK_DEPLOY'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Build APK & GitHub</span>
              </button>

              <a
                href="/HardwareShopPOS-Complete-Project.zip"
                download="HardwareShopPOS-Complete-Project.zip"
                className="rounded-lg px-2.5 py-1 font-bold transition flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                title="Download complete project ZIP with Android & Website files"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download .ZIP</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
