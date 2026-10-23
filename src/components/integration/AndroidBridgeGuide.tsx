import React, { useState } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Zap,
  Code,
  DollarSign,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface AndroidBridgeGuideProps {
  onTriggerDemoOrder?: () => Promise<void>;
}

export const AndroidBridgeGuide: React.FC<AndroidBridgeGuideProps> = ({
  onTriggerDemoOrder,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSimulate = async () => {
    if (!onTriggerDemoOrder) return;
    setSimulating(true);
    try {
      await onTriggerDemoOrder();
    } finally {
      setSimulating(false);
    }
  };

  const kotlinSnippet = `// In your Android app: com.hardwareshop.pos.data.website.LocalWebsiteTransport.kt
// Replace the fixed loopback URL with your live endpoint:
val connection = URL("https://\${serverHost}/api/orders").openConnection() as HttpURLConnection
connection.requestMethod = "GET"
connection.setRequestProperty("Accept", "application/json")
val ordersJson = connection.inputStream.bufferedReader().use { it.readText() }
// Returns real-time website orders straight into your Room Database & BillingViewModel!`;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Zero Cost / ₹0 Budget Callout */}
      <div className="rounded-2xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-200/60 px-3 py-0.5 text-xs font-bold text-emerald-900 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>100% ₹0 Free Budget Guarantee</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              You Do NOT Have to Pay for Anything!
            </h2>
            <p className="mt-1 text-sm text-slate-700 leading-relaxed">
              Everything in this setup is designed for the <strong>Zero-Cost Architecture (₹0 / $0)</strong>. No subscriptions, no paid APIs, and no credit card required.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-white p-3.5 border border-emerald-200">
                <div className="text-xs font-bold text-emerald-800 uppercase">1. Firebase Free Spark</div>
                <div className="mt-1 font-mono text-sm font-extrabold text-slate-900">₹0 / Month</div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  50,000 reads/day & unlimited FCM push notifications to your Android POS. No card needed.
                </p>
              </div>

              <div className="rounded-xl bg-white p-3.5 border border-emerald-200">
                <div className="text-xs font-bold text-emerald-800 uppercase">2. Website Hosting</div>
                <div className="mt-1 font-mono text-sm font-extrabold text-slate-900">₹0 / Month</div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Cloudflare Pages or Vercel Free tier handles high customer traffic with 100% free SSL & CDN.
                </p>
              </div>

              <div className="rounded-xl bg-white p-3.5 border border-emerald-200">
                <div className="text-xs font-bold text-emerald-800 uppercase">3. Real-Time Push</div>
                <div className="mt-1 font-mono text-sm font-extrabold text-slate-900">₹0 / Month</div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Live SSE & Webhook orders streaming directly to your billing app. Zero third-party fees.
                </p>
              </div>
            </div>

            {/* Daily Order Capacity Breakdown */}
            <div className="mt-4 rounded-xl bg-white p-4 border border-emerald-300 shadow-xs">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Daily Billing Volume & Free Tier Limits
                </span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                  Up to 10,000 Orders / Day (100% Free)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Firebase Spark Free Tier:</span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    20,000 writes/day & 50,000 reads/day = <span className="text-emerald-700">~6,600 to 10,000 online orders every single day</span>.
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Direct Server / SSE Connection:</span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    <span className="text-emerald-700">Unlimited orders</span>. No quota, no charges, and 0 paisa per transaction.
                  </p>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                💡 <em>A typical busy hardware shop does 50–300 bills/day. Even a massive wholesale depot does 500–1,500 bills/day. The free quota gives you <strong>over 20x to 50x daily headroom</strong> than you will ever need!</em>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zero Code - Working Out of the Box */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-900 mb-1">
              <Zap className="h-3.5 w-3.5" />
              <span>Zero-Code Solution Ready</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Orders Arrive in Your Billing App Automatically
            </h3>
            <p className="text-xs text-slate-500 max-w-xl">
              You don't need to write code. The entire bridge is built and running right here! Customers place orders online, and they instantly show up in the <strong>Web Orders</strong> queue with sound alerts.
            </p>
          </div>

          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-3 font-bold text-xs sm:text-sm text-slate-950 shadow-md transition active:scale-95 shrink-0"
          >
            <Sparkles className="h-4 w-4" />
            <span>{simulating ? 'Sending...' : 'Test: Send Live Order Now'}</span>
          </button>
        </div>

        {/* Live Endpoints Reference */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Production & Local REST Endpoints Built into Your System
          </h4>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-emerald-700 mr-2">GET</span>
                <span className="text-slate-800">/api/orders</span>
                <span className="text-slate-400 font-sans ml-2">— Fetch pending website orders for POS</span>
              </div>
              <button
                onClick={() => copyToClipboard('/api/orders', 1)}
                className="p-1 hover:text-amber-600"
              >
                {copiedIndex === 1 ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-blue-700 mr-2">POST</span>
                <span className="text-slate-800">/api/orders</span>
                <span className="text-slate-400 font-sans ml-2">— Customer website order creation</span>
              </div>
              <button
                onClick={() => copyToClipboard('/api/orders', 2)}
                className="p-1 hover:text-amber-600"
              >
                {copiedIndex === 2 ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-purple-700 mr-2">GET</span>
                <span className="text-slate-800">/api/stream</span>
                <span className="text-slate-400 font-sans ml-2">— Real-Time SSE Event Stream for Android POS</span>
              </div>
              <button
                onClick={() => copyToClipboard('/api/stream', 3)}
                className="p-1 hover:text-amber-600"
              >
                {copiedIndex === 3 ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-amber-700 mr-2">GET</span>
                <span className="text-slate-800">/shops/:shopId/orders</span>
                <span className="text-slate-400 font-sans ml-2">— Native HardwareShopPOS Android transport</span>
              </div>
              <button
                onClick={() => copyToClipboard('/shops/:shopId/orders', 4)}
                className="p-1 hover:text-amber-600"
              >
                {copiedIndex === 4 ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
              </button>
            </div>
          </div>
        </div>

        {/* Kotlin Integration Snippet */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-amber-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Optional: Connect Your Physical Android Phone/Tablet
              </h4>
            </div>
            <button
              onClick={() => copyToClipboard(kotlinSnippet, 5)}
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800"
            >
              {copiedIndex === 5 ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedIndex === 5 ? 'Copied' : 'Copy Kotlin Snippet'}</span>
            </button>
          </div>

          <pre className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-amber-400 overflow-x-auto leading-relaxed">
            {kotlinSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
};
