import React, { useState } from 'react';
import { CatalogFamily, ProductVariant, CartLineItem } from '../../types';
import { formatMoney, calculateLineTotal } from '../../utils/order-logic';
import { X, Plus, Minus, Check, Ruler } from 'lucide-react';

interface SizePickerModalProps {
  family: CatalogFamily | null;
  onClose: () => void;
  onAddToCart: (item: CartLineItem) => void;
}

export const SizePickerModal: React.FC<SizePickerModalProps> = ({
  family,
  onClose,
  onAddToCart,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    family?.products?.[0] || null
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [fullLengths, setFullLengths] = useState<number>(1);
  const [extraFeet, setExtraFeet] = useState<number>(0);
  const [lineNote, setLineNote] = useState<string>('');
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  React.useEffect(() => {
    if (family?.products?.[0]) {
      setSelectedVariant(family.products[0]);
    }
  }, [family]);

  if (!family || !selectedVariant) return null;

  const isPipe = family.isPipe || selectedVariant.isPipe;

  const currentTotal = calculateLineTotal(
    selectedVariant,
    quantity,
    fullLengths,
    extraFeet
  );

  const handleAdd = () => {
    const item: CartLineItem = {
      productId: selectedVariant.id,
      name: family.name,
      size: selectedVariant.size || 'Standard',
      unit: selectedVariant.unit || 'Piece',
      unitPricePaisa: Number(selectedVariant.sellingPricePaisa || 0),
      quantity: isPipe ? fullLengths : quantity,
      isPipe,
      fullLengths: isPipe ? fullLengths : undefined,
      extraFeet: isPipe ? extraFeet : undefined,
      note: lineNote.trim() || undefined,
      lineTotalPaisa: currentTotal,
    };

    onAddToCart(item);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4">
          <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            {family.category || 'Hardware'}
          </span>
          <h2 className="mt-2 text-xl font-bold text-slate-900">{family.name}</h2>
          <p className="text-sm text-slate-500">
            Select available sizes and quantities from the live inventory
          </p>
        </div>

        {/* Size Selection Pills */}
        <div className="mb-5">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
            Available Sizes ({family.products.length})
          </label>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
            {family.products.map((variant) => {
              const isSelected = selectedVariant.id === variant.id;
              const priceDisplay = formatMoney(variant.sellingPricePaisa);
              return (
                <button
                  key={variant.id}
                  onClick={() => {
                    setSelectedVariant(variant);
                    setAddedSuccess(false);
                  }}
                  className={`flex items-center justify-between rounded-xl border px-3.5 py-2 text-left text-sm transition ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/80 text-amber-900 ring-2 ring-amber-500/20 font-semibold'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span>{variant.size || variant.name}</span>
                  <span className="ml-2 font-mono text-xs font-bold text-amber-700">
                    {priceDisplay}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pipe Measurement Calculator OR Standard Quantity Controls */}
        {isPipe ? (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
            <div className="mb-3 flex items-center gap-2 text-amber-900">
              <Ruler className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Pipe Dimensions & Custom Cutting
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Lengths (20ft each)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFullLengths(Math.max(0, fullLengths - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="flex-1 text-center font-bold text-slate-900">
                    {fullLengths}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFullLengths(fullLengths + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-1 text-[11px] text-slate-500 text-center">
                  {formatMoney(selectedVariant.lengthPricePaisa || selectedVariant.sellingPricePaisa)} / length
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Extra Feet (cut off)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExtraFeet(Math.max(0, extraFeet - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="flex-1 text-center font-bold text-slate-900">
                    {extraFeet} ft
                  </span>
                  <button
                    type="button"
                    onClick={() => setExtraFeet(extraFeet + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-1 text-[11px] text-slate-500 text-center">
                  {formatMoney(selectedVariant.footPricePaisa || 2000)} / foot
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <span className="text-sm font-semibold text-slate-800">Quantity</span>
              <p className="text-xs text-slate-500">Unit: {selectedVariant.unit || 'Piece'}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-mono text-base font-bold text-slate-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Optional note */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Item Note (optional instructions for shop staff)
          </label>
          <input
            type="text"
            value={lineNote}
            onChange={(e) => setLineNote(e.target.value)}
            placeholder="e.g. Cut into two 10ft pieces, or specify brand preference"
            maxLength={200}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        {/* Action and Total */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <span className="text-xs text-slate-500">Total Price</span>
            <div className="font-mono text-xl font-bold text-slate-900">
              {formatMoney(currentTotal)}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={isPipe ? fullLengths === 0 && extraFeet === 0 : quantity <= 0}
            className={`flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition ${
              addedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-600 text-white hover:bg-amber-700 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400'
            }`}
          >
            {addedSuccess ? (
              <>
                <Check className="h-4 w-4" />
                <span>Added to Cart!</span>
              </>
            ) : (
              <span>Add to Cart</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
