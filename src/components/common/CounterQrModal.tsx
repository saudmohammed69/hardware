import React from 'react';
import {
  X,
  Printer,
  Smartphone,
  QrCode,
  ArrowRight,
  CheckCircle2,
  Store,
  Sparkles,
  ShoppingBag,
  Bell,
  Receipt,
} from 'lucide-react';

interface CounterQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateScan: () => void;
}

export const CounterQrModal: React.FC<CounterQrModalProps> = ({
  isOpen,
  onClose,
  onSimulateScan,
}) => {
  if (!isOpen) return null;

  const handlePrintStandee = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 print:hidden transition"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-slate-100 pb-4 print:hidden">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 mb-2">
            <QrCode className="h-3.5 w-3.5" />
            <span>Counter Standee & Customer Journey</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Scan QR Code ➔ Order ➔ Billing Counter Flow
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Place this QR standee on your shop counter. Customers scan with their phone, select products, and their orders fly straight into your POS billing terminal.
          </p>
        </div>

        {/* The 5-Step Visual Flow */}
        <div className="my-6 grid grid-cols-1 sm:grid-cols-5 gap-2 text-center print:hidden">
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center mb-1.5 shadow-sm">
              1
            </div>
            <div className="font-bold text-xs text-slate-900">Scan QR Code</div>
            <p className="text-[11px] text-slate-500 mt-1">Customer scans at shop counter</p>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center mb-1.5">
              2
            </div>
            <div className="font-bold text-xs text-slate-900">Select Items</div>
            <p className="text-[11px] text-slate-500 mt-1">Pipes, fittings, cement & tools</p>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center mb-1.5">
              3
            </div>
            <div className="font-bold text-xs text-slate-900">Enter Name & No</div>
            <p className="text-[11px] text-slate-500 mt-1">Submits order to counter POS</p>
          </div>

          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center mb-1.5 shadow-sm">
              4
            </div>
            <div className="font-bold text-xs text-slate-900">POS Chimes Alert</div>
            <p className="text-[11px] text-slate-500 mt-1">Worker packs items from shelves</p>
          </div>

          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center mb-1.5 shadow-sm">
              5
            </div>
            <div className="font-bold text-xs text-emerald-950">Generate Bill</div>
            <p className="text-[11px] text-slate-500 mt-1">Cash/UPI + Print thermal invoice</p>
          </div>
        </div>

        {/* Counter Standee Card (Printable) */}
        <div className="rounded-2xl border-2 border-slate-900 bg-white p-6 text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-3 bg-amber-500"></div>

          <div className="pt-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-slate-500">
              <Store className="h-3.5 w-3.5 text-amber-600" />
              <span>HardwareShopPOS</span>
            </div>
            <h3 className="mt-1 text-xl sm:text-2xl font-black text-slate-950">
              SCAN TO VIEW ITEMS & PRICES
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Browse 1,478 hardware products, pipe sizes & order directly to this counter
            </p>
          </div>

          {/* QR Artwork */}
          <div className="my-5 flex justify-center">
            <div className="p-3 rounded-2xl border-2 border-slate-900 bg-white shadow-md inline-block">
              <img
                src="/HardwareShopPOS-QR.png"
                alt="HardwareShopPOS Counter QR Code"
                className="h-48 w-48 sm:h-56 sm:w-56 object-contain mx-auto"
                onError={(e) => {
                  // Fallback to stylized SVG QR if image asset path varies
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <p className="font-mono text-xs font-bold text-slate-900">
              https://hardwareshoppos.pages.dev/
            </p>
            <p className="text-[11px] font-semibold text-emerald-700">
              ✓ Instant Self-Ordering · ✓ Pipe Cut Dimensions · ✓ Counter Pickup
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <button
            onClick={() => {
              onSimulateScan();
              onClose();
            }}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-3.5 text-xs sm:text-sm font-extrabold text-slate-950 shadow-md transition active:scale-95"
          >
            <Smartphone className="h-4 w-4" />
            <span>Simulate Customer Scanning QR Code</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={handlePrintStandee}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md transition"
          >
            <Printer className="h-4 w-4" />
            <span>Print Counter Standee Sheet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
