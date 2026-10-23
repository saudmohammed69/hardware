import React, { useState } from 'react';
import {
  Smartphone,
  Github,
  Globe,
  Terminal,
  CheckCircle2,
  Copy,
  Check,
  Download,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Printer,
  Sparkles,
  Zap,
  Info,
  Layers,
  FolderGit2,
} from 'lucide-react';

interface ApkDeployCenterProps {
  onTriggerDemoOrder?: () => Promise<void>;
  onGoToStorefront: () => void;
  onGoToPOS: () => void;
}

export const ApkDeployCenter: React.FC<ApkDeployCenterProps> = ({
  onTriggerDemoOrder,
  onGoToStorefront,
  onGoToPOS,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'GITHUB' | 'LOCAL' | 'CLOUDFLARE' | 'PRINTER'>('GITHUB');
  const [isSimulating, setIsSimulating] = useState(false);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSimulate = async () => {
    if (!onTriggerDemoOrder) return;
    setIsSimulating(true);
    try {
      await onTriggerDemoOrder();
    } finally {
      setIsSimulating(false);
    }
  };

  const githubWorkflowCode = `name: Build HardwareShopPOS Android APK

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]
  workflow_dispatch:

jobs:
  build:
    name: Build Android APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Set up JDK 17 (Temurin)
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: gradle

      - name: Grant Execute Permission to Gradlew
        run: chmod +x android/gradlew

      - name: Assemble Debug APK
        run: |
          cd android
          ./gradlew assembleDebug --no-daemon --stacktrace

      - name: Upload Debug APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: HardwareShopPOS-Debug-APK
          path: android/app/build/outputs/apk/debug/*.apk
          retention-days: 30

      - name: Assemble Release APK
        run: |
          cd android
          ./gradlew assembleRelease --no-daemon --stacktrace || true

      - name: Upload Release APK Artifact
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: HardwareShopPOS-Release-APK
          path: android/app/build/outputs/apk/release/*.apk
          retention-days: 30`;

  const downloadWorkflowFile = () => {
    const blob = new Blob([githubWorkflowCode], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build-apk.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Hero Banner */}
      <div className="rounded-3xl border-2 border-slate-900 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Full Release & Build Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              HardwareShopPOS — Website + APK Build
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Complete guide to deploy both your customer ordering website and build your final Android APK from your GitHub repository (<code>saudmohammed69/HardwareShopPOS</code>) with zero cost and zero paid subscriptions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-md transition active:scale-95"
            >
              <Zap className="h-4 w-4" />
              <span>{isSimulating ? 'Sending...' : 'Test Live Order Flow'}</span>
            </button>
            <button
              onClick={onGoToPOS}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs sm:text-sm font-bold text-white transition active:scale-95"
            >
              <Smartphone className="h-4 w-4" />
              <span>Open POS Register</span>
            </button>
          </div>
        </div>

        {/* 3 Pillars Summary */}
        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Globe className="h-4 w-4" />
              <span>1. Customer Website</span>
            </div>
            <p className="mt-1 text-xs text-slate-300 font-medium">
              Live at <span className="font-mono text-amber-300">hardwareshoppos.pages.dev</span> with 1,478 catalog items, pipe length calculations & instant mobile cart.
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Github className="h-4 w-4" />
              <span>2. GitHub Actions APK</span>
            </div>
            <p className="mt-1 text-xs text-slate-300 font-medium">
              Automated cloud build builds <span className="font-mono text-emerald-300">app-debug.apk</span> directly in GitHub. 100% free, 0 setup required on your PC.
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
              <Printer className="h-4 w-4" />
              <span>3. 58mm Thermal POS</span>
            </div>
            <p className="mt-1 text-xs text-slate-300 font-medium">
              Formatted for standard 58mm/57mm (2-inch, 384 dot) Bluetooth thermal receipt rolls with monospace alignment & UPI QR.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('GITHUB')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === 'GITHUB'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Github className="h-4 w-4" />
          <span>Build APK via GitHub Actions (Recommended)</span>
        </button>

        <button
          onClick={() => setActiveTab('LOCAL')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === 'LOCAL'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Terminal className="h-4 w-4" />
          <span>Build Locally via Gradle / Terminal</span>
        </button>

        <button
          onClick={() => setActiveTab('CLOUDFLARE')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === 'CLOUDFLARE'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>Cloudflare Pages & Website Sync</span>
        </button>

        <button
          onClick={() => setActiveTab('PRINTER')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === 'PRINTER'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Printer className="h-4 w-4" />
          <span>58mm Printer & POS Rules</span>
        </button>
      </div>

      {/* Tab 1: GitHub Actions APK Builder */}
      {activeTab === 'GITHUB' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-900 mb-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Zero-Code / Zero-Setup Build</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  How to Build the Final APK on GitHub in 3 Minutes
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  You don’t need Android Studio or a powerful laptop. GitHub compiles the Android APK directly in the cloud for free!
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={downloadWorkflowFile}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-bold shadow-sm transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Workflow File</span>
                </button>
                <button
                  onClick={() => copyText(githubWorkflowCode, 'workflow')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 text-xs font-bold shadow-sm transition"
                >
                  {copiedKey === 'workflow' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedKey === 'workflow' ? 'Copied!' : 'Copy Workflow Code'}</span>
                </button>
              </div>
            </div>

            {/* 3 Step Visual Guide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white font-mono font-bold text-xs">
                    1
                  </span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                    Create File in Repo
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  In your repository <code>HardwareShopPOS</code> on GitHub, click <strong>Add file → Create new file</strong> and name the path:
                </p>
                <code className="block bg-white p-2 rounded-lg border border-slate-200 text-xs font-mono font-bold text-amber-700">
                  .github/workflows/build-apk.yml
                </code>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white font-mono font-bold text-xs">
                    2
                  </span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                    Paste & Commit
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Paste the workflow code shown below and click <strong>Commit changes</strong> directly to the <code>main</code> branch.
                </p>
                <div className="bg-white p-2 rounded-lg border border-slate-200 text-[11px] text-slate-500">
                  ✓ Triggers automatic build immediately upon commit
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white font-mono font-bold text-xs">
                    3
                  </span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                    Download APK to Phone
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Go to GitHub <strong>Actions</strong> tab → click the latest run → scroll down to <strong>Artifacts</strong> and tap:
                </p>
                <code className="block bg-emerald-50 p-2 rounded-lg border border-emerald-200 text-xs font-mono font-bold text-emerald-800">
                  HardwareShopPOS-Debug-APK.zip
                </code>
              </div>
            </div>

            {/* Workflow Code View */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Workflow File Content (<code>.github/workflows/build-apk.yml</code>)
                </span>
                <span className="text-[11px] text-slate-400">Java 17 Temurin · Gradle 8.7 · SDK 35</span>
              </div>
              <pre className="rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed border border-slate-800">
                {githubWorkflowCode}
              </pre>
            </div>

            {/* Android Phone Installation Tips */}
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <Info className="h-4 w-4 text-amber-700" />
                <span>Installing the APK on your Android Phone / Counter Tablet</span>
              </div>
              <ol className="list-decimal list-inside text-xs text-amber-900 space-y-1">
                <li>Download the APK onto your Android device (or send it via WhatsApp / Google Drive).</li>
                <li>Tap the downloaded <code>.apk</code> file. If prompted, toggle <strong>"Allow from this source"</strong> in Settings.</li>
                <li>Tap <strong>Install</strong>. The app installs as <strong>HardwareShopPOS</strong>.</li>
                <li>Grant Bluetooth and Notification permissions so orders pop up with sound and print receipts!</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Local Gradle Build */}
      {activeTab === 'LOCAL' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Building the APK Locally on Your Computer
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              If you have Android Studio or Java 17 installed on your Windows, Mac, or Linux computer:
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  1. Clone your repository
                </span>
                <button
                  onClick={() => copyText('git clone https://github.com/saudmohammed69/HardwareShopPOS.git', 'cmd-clone')}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                >
                  {copiedKey === 'cmd-clone' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedKey === 'cmd-clone' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="rounded-xl bg-slate-950 p-3 font-mono text-xs text-amber-400">
                git clone https://github.com/saudmohammed69/HardwareShopPOS.git
              </pre>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  2. Navigate to android folder & build Debug APK
                </span>
                <button
                  onClick={() => copyText('cd HardwareShopPOS/android && ./gradlew assembleDebug', 'cmd-build-debug')}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                >
                  {copiedKey === 'cmd-build-debug' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedKey === 'cmd-build-debug' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="rounded-xl bg-slate-950 p-3 font-mono text-xs text-emerald-400">
                cd HardwareShopPOS/android{'\n'}./gradlew assembleDebug
              </pre>
              <p className="text-[11px] text-slate-500">
                On Windows Command Prompt / PowerShell use: <code>gradlew.bat assembleDebug</code>
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  3. Output APK Location
                </span>
                <button
                  onClick={() => copyText('android/app/build/outputs/apk/debug/app-debug.apk', 'apk-path')}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                >
                  {copiedKey === 'apk-path' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedKey === 'apk-path' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800">
                android/app/build/outputs/apk/debug/app-debug.apk
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  4. Install directly to connected phone via USB (Optional)
                </span>
                <button
                  onClick={() => copyText('adb install -r android/app/build/outputs/apk/debug/app-debug.apk', 'cmd-adb')}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                >
                  {copiedKey === 'cmd-adb' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedKey === 'cmd-adb' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="rounded-xl bg-slate-950 p-3 font-mono text-xs text-sky-400">
                adb install -r android/app/build/outputs/apk/debug/app-debug.apk
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Cloudflare Pages & Website Sync */}
      {activeTab === 'CLOUDFLARE' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-900 mb-1">
                <Globe className="h-3.5 w-3.5" />
                <span>Cloudflare Pages Deployed</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Customer Website & Cloudflare Sync Status
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Your shop’s customer catalog is published and accessible via QR code and web browsers.
              </p>
            </div>

            <a
              href="https://hardwareshoppos.pages.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-xs font-bold shadow-sm transition shrink-0"
            >
              <span>Visit hardwareshoppos.pages.dev</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Production Website URL
              </h4>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                <span className="font-mono text-xs text-slate-800 select-all">
                  https://hardwareshoppos.pages.dev/
                </span>
                <button
                  onClick={() => copyText('https://hardwareshoppos.pages.dev/', 'site-url')}
                  className="p-1 hover:text-amber-600"
                >
                  {copiedKey === 'site-url' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                This exact link is encoded in your shop counter QR code standee so customers scan and order instantly.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                1-Click Deploy / Update via Wrangler
              </h4>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 font-mono text-xs">
                <span className="text-slate-800 truncate">
                  npx wrangler pages deploy public --project-name hardwareshoppos
                </span>
                <button
                  onClick={() => copyText('npx wrangler pages deploy public --project-name hardwareshoppos', 'deploy-cmd')}
                  className="p-1 hover:text-amber-600 shrink-0"
                >
                  {copiedKey === 'deploy-cmd' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Deploys static updates straight to Cloudflare with 0 server maintenance.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <span>Customer Safety & Price Protection Verified</span>
            </div>
            <ul className="list-disc list-inside text-xs text-emerald-900 space-y-1">
              <li><strong>Zero Purchase Price Leak:</strong> The website never contains supplier costs or purchase prices.</li>
              <li><strong>Zero Inventory Alteration:</strong> Customers ordering online cannot change shop stock; stock is only updated when the cashier generates the official bill.</li>
              <li><strong>Zero Accidental Double Bills:</strong> Once an order is loaded into the POS and billed, it is stamped with the final invoice number and completed.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 4: 58mm Thermal Printer & POS Rules */}
      {activeTab === 'PRINTER' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                58mm / 57mm Thermal Printer Specifications
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Calibrated specifically for your 2-inch mini Bluetooth POS receipt printer.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="text-xs font-bold text-slate-500 uppercase">Roll Width</div>
              <div className="mt-1 font-mono text-base font-extrabold text-slate-900">58mm / 57mm</div>
              <p className="text-[11px] text-slate-500 mt-0.5">2.28 inches / standard roll diameter</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="text-xs font-bold text-slate-500 uppercase">Column Character Width</div>
              <div className="mt-1 font-mono text-base font-extrabold text-slate-900">32 Characters</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Standard Font A monospace layout</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="text-xs font-bold text-slate-500 uppercase">Print Resolution</div>
              <div className="mt-1 font-mono text-base font-extrabold text-slate-900">384 Dots / Line</div>
              <p className="text-[11px] text-slate-500 mt-0.5">203 DPI thermal print head</p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-amber-300 space-y-1">
            <div className="text-center font-bold text-white">================================</div>
            <div className="text-center font-black text-white text-sm">HARDWARE SHOP POS</div>
            <div className="text-center text-slate-400 text-[10px]">Main Rd, Hardware Bazaar</div>
            <div className="text-center text-slate-400 text-[10px]">Ph: +91 98450 00000 · GSTIN: 29ABC...</div>
            <div className="text-center font-bold text-white">--------------------------------</div>
            <div className="flex justify-between">
              <span>Bill: INV-2026-0104</span>
              <span>22/10/2026 12:15</span>
            </div>
            <div className="flex justify-between">
              <span>Cust: Ramesh Patel</span>
              <span>9845012345</span>
            </div>
            <div className="text-center font-bold text-white">--------------------------------</div>
            <div className="flex justify-between font-bold text-white">
              <span>ITEM (QTY x RATE)</span>
              <span>AMT (Rs.)</span>
            </div>
            <div className="text-center font-bold text-white">--------------------------------</div>
            <div className="flex justify-between">
              <span>Supreme CPVC Pipe 1" (3 Lg)</span>
              <span>1,200.00</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>+ Cut 6 ft @ Rs.35/ft</span>
              <span>210.00</span>
            </div>
            <div className="flex justify-between">
              <span>CPVC Elbow 90 Heavy (6 pc)</span>
              <span>192.00</span>
            </div>
            <div className="text-center font-bold text-white">--------------------------------</div>
            <div className="flex justify-between font-bold text-white text-sm">
              <span>TOTAL PAYABLE</span>
              <span>Rs. 1,602.00</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Payment Mode: UPI (Paid)</span>
              <span>Worker: Saud</span>
            </div>
            <div className="text-center font-bold text-white">================================</div>
            <div className="text-center text-slate-400 text-[10px]">Thank you! Visit again.</div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={onGoToPOS}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 text-xs sm:text-sm font-bold shadow-md transition"
            >
              <span>Test 58mm Thermal Print in Billing Register</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
