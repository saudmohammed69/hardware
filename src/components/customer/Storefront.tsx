import React, { useState, useEffect, useMemo } from 'react';
import { CatalogFamily, ProductVariant, CartLineItem } from '../../types';
import { formatMoney, normalizeSearch } from '../../utils/order-logic';
import { SizePickerModal } from './SizePickerModal';
import { Search, ShoppingBag, X, ChevronRight, Layers, Sparkles } from 'lucide-react';

interface StorefrontProps {
  cart: CartLineItem[];
  onOpenCart: () => void;
  onAddToCart: (item: CartLineItem) => void;
}

export const Storefront: React.FC<StorefrontProps> = ({
  cart,
  onOpenCart,
  onAddToCart,
}) => {
  const [families, setFamilies] = useState<CatalogFamily[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeFamilyForModal, setActiveFamilyForModal] = useState<CatalogFamily | null>(null);

  // Load catalog data from public/catalog.json
  useEffect(() => {
    async function loadCatalog() {
      try {
        setLoading(true);
        const res = await fetch('/catalog.json');
        if (!res.ok) throw new Error('Failed to load catalog');
        const data = await res.json();
        const rawProducts: any[] = data.products || [];

        // Group individual variants by family name
        const groupMap = new Map<string, CatalogFamily>();

        for (let i = 0; i < rawProducts.length; i++) {
          const p = rawProducts[i];
          const name = p.name?.trim() || 'Hardware Item';
          const normalizedKey = normalizeSearch(name);

          // Infer category based on product title
          let category = 'Hardware';
          const lower = name.toLowerCase();
          if (lower.includes('pipe') || lower.includes('pvc') || lower.includes('cpvc') || lower.includes('cock') || lower.includes('valve') || lower.includes('elbow')) {
            category = 'Pipes & Plumbing';
          } else if (lower.includes('wire') || lower.includes('switch') || lower.includes('strip') || lower.includes('amp') || lower.includes('tape') || lower.includes('electrical')) {
            category = 'Electrical';
          } else if (lower.includes('bolt') || lower.includes('screw') || lower.includes('washer') || lower.includes('anchor') || lower.includes('nail')) {
            category = 'Fasteners & Bolts';
          } else if (lower.includes('hammer') || lower.includes('blade') || lower.includes('tool') || lower.includes('wiper') || lower.includes('brush') || lower.includes('abrasive')) {
            category = 'Tools & Blades';
          } else if (lower.includes('cement') || lower.includes('mesh') || lower.includes('window') || lower.includes('primer') || lower.includes('commode')) {
            category = 'Building & Paints';
          }

          const isPipe = Boolean(p.isPipe || lower.includes('pipe'));

          if (!groupMap.has(normalizedKey)) {
            groupMap.set(normalizedKey, {
              name,
              category,
              products: [],
              search: normalizeSearch(name),
              isPipe,
            });
          }

          const family = groupMap.get(normalizedKey)!;
          const variant: ProductVariant = {
            id: p.id || `prod-${i}`,
            name,
            size: p.size || '',
            unit: p.unit || 'Piece',
            sellingPricePaisa: p.sellingPricePaisa || 0,
            isPipe,
            lengthPricePaisa: p.lengthPricePaisa || p.sellingPricePaisa,
            footPricePaisa: p.footPricePaisa || Math.round(Number(p.sellingPricePaisa || 0) / 10),
            aliases: p.aliases || '',
          };
          family.products.push(variant);
          family.search += ' ' + normalizeSearch(p.size || '') + ' ' + normalizeSearch(p.unit || '') + ' ' + normalizeSearch(p.aliases || '');
        }

        // Sort families alphabetically
        const familyList = Array.from(groupMap.values()).sort((a, b) =>
          a.name.localeCompare(b.name, 'en-IN')
        );

        setFamilies(familyList);
      } catch (err) {
        console.error('Error fetching catalog:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCatalog();
  }, []);

  const categories = useMemo(() => {
    return ['All', 'Pipes & Plumbing', 'Fasteners & Bolts', 'Electrical', 'Tools & Blades', 'Building & Paints'];
  }, []);

  // Filtered families based on category and search query
  const filteredFamilies = useMemo(() => {
    const q = normalizeSearch(searchQuery);
    return families.filter((f) => {
      const matchCategory = selectedCategory === 'All' || f.category === selectedCategory;
      const matchSearch = !q || f.search.includes(q);
      return matchCategory && matchSearch;
    });
  }, [families, selectedCategory, searchQuery]);

  const totalCartCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const totalCartPaisa = cart.reduce((acc, item) => acc + (item.lineTotalPaisa || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-28">
      {/* Hero Storefront Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 text-white px-4 py-8 sm:py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live Shop Order Integration</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Online Hardware & Tools Catalog
              </h1>
              <p className="mt-1 text-slate-300 text-sm sm:text-base max-w-xl">
                Order pipes, electricals, fasteners, and tools directly to the shop counter. Real-time availability & instant counter pickup.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onOpenCart}
                className="relative inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>View Cart</span>
                {totalCartCount > 0 && (
                  <span className="bg-slate-950 text-white text-xs px-2 py-0.5 rounded-full font-mono">
                    {totalCartCount}
                  </span>
                )}
                {totalCartPaisa > 0 && (
                  <span className="font-mono ml-1 font-extrabold text-amber-950 border-l border-amber-600/30 pl-2">
                    {formatMoney(totalCartPaisa)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="mt-6">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across 1,478 items (e.g. PVC pipe, 1 inch bolt, hammer, cement...)"
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 text-sm sm:text-base shadow-xl focus:outline-none focus:ring-4 focus:ring-amber-500/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick search tags */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="text-slate-400">Popular:</span>
              {['PVC Pipe', 'Supreme', 'Cement', 'Hex Bolt', 'Washer', 'Hammer', 'Wire'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="rounded-full bg-white/10 hover:bg-white/20 px-2.5 py-1 text-slate-200 transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog Section */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  active
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Catalog Items Header */}
        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>{selectedCategory} Items</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {filteredFamilies.length} items
            </span>
          </h2>
          <span className="text-xs text-slate-500">
            Click any product to select size & pipe lengths
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-12 flex flex-col items-center justify-center py-16 text-center">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading 1,478 hardware items and prices...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredFamilies.length === 0 && (
          <div className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Layers className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-3 text-lg font-bold text-slate-800">No items found</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              We couldn't find anything matching "{searchQuery}". Try a different spelling or browse categories.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Products Grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFamilies.slice(0, 90).map((family) => {
            const minPrice = Math.min(
              ...family.products.map((p) => Number(p.sellingPricePaisa || 0))
            );
            const variantCount = family.products.length;

            return (
              <div
                key={family.name}
                onClick={() => setActiveFamilyForModal(family)}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-amber-400 hover:shadow-md transition cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      {family.category}
                    </span>
                    {family.isPipe && (
                      <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                        Pipe / Lengths
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2 text-sm sm:text-base font-bold text-slate-900 group-hover:text-amber-600 transition line-clamp-2">
                    {family.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">
                      {variantCount} {variantCount === 1 ? 'size' : 'sizes'} available
                    </span>
                    <span>•</span>
                    <span className="line-clamp-1">
                      {family.products.slice(0, 3).map((p) => p.size || p.unit).filter(Boolean).join(', ')}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-[11px] text-slate-400">Starting from</span>
                    <div className="font-mono text-base font-bold text-slate-900">
                      {formatMoney(minPrice)}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-900 group-hover:bg-amber-600 px-3.5 py-2 text-xs font-bold text-white transition"
                  >
                    <span>Choose</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Cart Bar for Mobile & Desktop */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-xl mx-auto">
          <div className="flex items-center justify-between rounded-2xl bg-slate-950 text-white p-4 shadow-2xl border border-slate-800/80 backdrop-blur-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-300">
                  {totalCartCount} items in cart
                </div>
                <div className="font-mono text-base font-bold text-white">
                  {formatMoney(totalCartPaisa)}
                </div>
              </div>
            </div>

            <button
              onClick={onOpenCart}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-950 transition active:scale-95"
            >
              <span>Review Order</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Size Picker / Pipe Calculator Modal */}
      {activeFamilyForModal && (
        <SizePickerModal
          family={activeFamilyForModal}
          onClose={() => setActiveFamilyForModal(null)}
          onAddToCart={onAddToCart}
        />
      )}
    </div>
  );
};
