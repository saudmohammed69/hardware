import React from 'react';
import {
  Globe,
  Receipt,
  Columns,
  ShieldCheck,
  ShoppingBag,
  Bell,
  Volume2,
  VolumeX,
  Store,
  Smartphone,
  Github,
} from 'lucide-react';

export type AppMode = 'STOREFRONT' | 'POS' | 'SPLIT' | 'GUIDE' | 'APK_DEPLOY';

interface HeaderProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  newOrdersCount: number;
  cartCount: number;
  onOpenCart: () => void;
  onOpenQrModal: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  setMode,
  newOrdersCount,
  cartCount,
  onOpenCart,
  onOpenQrModal,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Live Connection Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                  HardwareShopPOS
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>POS Sync Active</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Customer Website ⟷ Counter Billing Link
              </p>
            </div>
          </div>

          {/* Mobile Cart Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onOpenCart}
              className="relative rounded-xl bg-slate-100 p-2 text-slate-700"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setMode('STOREFRONT')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap ${
              mode === 'STOREFRONT'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>Customer Website</span>
          </button>

          <button
            onClick={() => setMode('POS')}
            className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap ${
              mode === 'POS'
                ? 'bg-slate-950 text-white shadow-sm'
                : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            <Receipt className="h-4 w-4" />
            <span>Billing App (POS)</span>
            {newOrdersCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-mono font-black text-slate-950 animate-bounce">
                {newOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMode('SPLIT')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap ${
              mode === 'SPLIT'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
            }`}
            title="See website on the left and billing app on the right side-by-side"
          >
            <Columns className="h-4 w-4" />
            <span>Side-by-Side Live View</span>
          </button>

          <button
            onClick={() => setMode('GUIDE')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap ${
              mode === 'GUIDE'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            <span>₹0 Free Guarantee</span>
          </button>

          <button
            onClick={() => setMode('APK_DEPLOY')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap ${
              mode === 'APK_DEPLOY'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
            }`}
            title="How to build the final APK on GitHub Actions or Gradle & deploy website"
          >
            <Smartphone className="h-4 w-4" />
            <span>Build APK & GitHub</span>
          </button>

          <button
            onClick={onOpenQrModal}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-950 border border-amber-300/80 px-3 py-2 text-xs font-extrabold transition whitespace-nowrap"
            title="View printable counter QR code artwork for shop billing glass"
          >
            <Store className="h-4 w-4 text-amber-700" />
            <span>Counter QR Standee</span>
          </button>

          {/* Desktop Utilities */}
          <div className="hidden md:flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-3">
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-xl transition ${
                soundEnabled
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-400'
              }`}
              title={soundEnabled ? 'Mute order notification' : 'Enable order chime'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
