import React, { useState } from 'react';
import { CompletedBill, ShopSettings } from '../../types';
import { formatMoney } from '../../utils/order-logic';
import { X, Printer, CheckCircle, QrCode, SlidersHorizontal } from 'lucide-react';

interface ThermalReceiptModalProps {
  bill: CompletedBill | null;
  settings: ShopSettings;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  bill,
  settings,
  onClose,
}) => {
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('58mm');

  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(bill.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = new Date(bill.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const is58mm = paperWidth === '58mm';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 print:hidden transition"
          aria-label="Close invoice"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header & Width Switcher */}
        <div className="mb-4 print:hidden">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-bold">Bill Successfully Invoiced!</span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-slate-100 p-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 font-bold ml-1">
              <SlidersHorizontal className="h-3.5 w-3.5 text-amber-600" />
              <span>Printer Paper Roll:</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPaperWidth('58mm')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  is58mm
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                58mm / 57mm (2-inch POS)
              </button>
              <button
                type="button"
                onClick={() => setPaperWidth('80mm')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  !is58mm
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                80mm (3-inch)
              </button>
            </div>
          </div>
        </div>

        {/* 58mm / 57mm Thermal Receipt Paper Simulation */}
        <div className="flex justify-center my-2">
          <div
            className={`rounded-xl border border-slate-300 bg-white p-4 font-mono text-slate-900 shadow-sm print:border-none print:shadow-none print:p-0 transition-all ${
              is58mm
                ? 'w-[58mm] max-w-[58mm] text-[10px] leading-tight tracking-tight'
                : 'w-[80mm] max-w-[80mm] text-xs'
            }`}
            style={{
              fontFamily: '"JetBrains Mono", "Courier New", Courier, monospace',
            }}
          >
            {/* Header */}
            <div className="text-center border-b border-dashed border-slate-400 pb-2">
              <h2 className={`font-black uppercase tracking-tight text-slate-950 ${is58mm ? 'text-xs' : 'text-sm'}`}>
                {settings.shopName}
              </h2>
              <p className="text-[9px] text-slate-600 mt-0.5 leading-snug">{settings.shopAddress}</p>
              <p className="text-[9px] text-slate-600">Ph: {settings.shopPhone}</p>
              <p className="text-[9px] font-bold text-slate-800 mt-0.5">GSTIN: {settings.gstin}</p>
              <div className="mt-1.5 text-[10px] font-black bg-slate-100 py-0.5 rounded border border-slate-200">
                TAX INVOICE / CASH MEMO
              </div>
            </div>

            {/* Bill Meta */}
            <div className="py-2 border-b border-dashed border-slate-400 text-[9px] space-y-0.5">
              <div className="flex justify-between">
                <span>INV: <strong>{bill.id}</strong></span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>TIME: {formattedTime}</span>
                <span>BY: {bill.cashierName.split(' ')[0]}</span>
              </div>
              {bill.orderId && (
                <div className="flex justify-between text-amber-900 font-bold">
                  <span>WEB ORDER:</span>
                  <span>{bill.orderId}</span>
                </div>
              )}
              <div className="pt-0.5 truncate">
                <span>CUST: <strong>{bill.customerName}</strong></span>
                {bill.customerPhone && <span className="ml-1">({bill.customerPhone})</span>}
              </div>
            </div>

            {/* Items Table */}
            <div className="py-2 border-b border-dashed border-slate-400">
              <div className="flex justify-between font-bold text-[9px] border-b border-slate-300 pb-1 mb-1">
                <span className="w-6/12 truncate">ITEM</span>
                <span className="w-2/12 text-center">QTY</span>
                <span className="w-4/12 text-right">TOTAL</span>
              </div>

              <div className="space-y-1.5 pt-0.5">
                {bill.items.map((item, idx) => (
                  <div key={idx} className="text-[9px]">
                    <div className="flex justify-between items-start">
                      <div className="w-6/12 font-semibold truncate leading-tight">
                        {item.name}
                      </div>
                      <div className="w-2/12 text-center font-bold">
                        {item.isPipe ? item.fullLengths : item.quantity}
                      </div>
                      <div className="w-4/12 text-right font-bold">
                        {formatMoney(item.lineTotalPaisa)}
                      </div>
                    </div>
                    <div className="text-[8px] text-slate-500 pl-1 leading-none">
                      {item.size} {item.unit}
                      {item.isPipe && (
                        <span className="text-amber-800"> ({item.fullLengths}L+{item.extraFeet}ft cut)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="py-2 border-b border-dashed border-slate-400 space-y-0.5 text-[9px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatMoney(bill.subtotalPaisa)}</span>
              </div>
              {bill.discountPaisa > 0 && (
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>Discount:</span>
                  <span>-{formatMoney(bill.discountPaisa)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>CGST (9%):</span>
                <span>{formatMoney(Math.round(bill.gstPaisa / 2))}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>SGST (9%):</span>
                <span>{formatMoney(bill.gstPaisa - Math.round(bill.gstPaisa / 2))}</span>
              </div>
              {bill.roundOffPaisa !== 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Round Off:</span>
                  <span>{formatMoney(bill.roundOffPaisa)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-black pt-1.5 border-t border-slate-300">
                <span>TOTAL:</span>
                <span className="text-xs sm:text-sm">{formatMoney(bill.finalTotalPaisa)}</span>
              </div>
            </div>

            {/* Payment & Footer */}
            <div className="pt-2 text-center space-y-1.5">
              <div className="inline-block rounded bg-slate-100 px-2 py-0.5 font-bold text-[9px] border border-slate-200">
                PAID: {bill.paymentMode} {bill.paymentMode === 'UPI' && `(${settings.upiId})`}
              </div>

              <div className="flex justify-center py-1">
                <div className="p-1 border border-slate-200 rounded-lg inline-flex flex-col items-center bg-white">
                  <QrCode className="h-14 w-14 text-slate-900" />
                  <span className="text-[7px] text-slate-400 mt-0.5">UPI Verified</span>
                </div>
              </div>

              <p className="text-[8px] text-slate-500 leading-tight">
                Goods once sold cannot be returned without bill.
              </p>
              <p className="text-[9px] font-black tracking-tight">
                *** THANK YOU! VISIT AGAIN ***
              </p>
            </div>
          </div>
        </div>

        {/* Print Styles for 58mm / 57mm Thermal Roll */}
        <style>{`
          @media print {
            @page {
              size: ${is58mm ? '58mm auto' : '80mm auto'};
              margin: 0;
            }
            body {
              width: ${is58mm ? '58mm !important' : '80mm !important'};
              margin: 0 !important;
              padding: 2mm !important;
              background: #fff !important;
            }
          }
        `}</style>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center justify-between gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 py-3 text-xs font-extrabold text-white shadow-md transition active:scale-95"
          >
            <Printer className="h-4 w-4 text-amber-400" />
            <span>Print 58mm Thermal Bill</span>
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
