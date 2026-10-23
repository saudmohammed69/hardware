# HardwareShopPOS — Customer Website & Android POS Sync

This package contains the complete, connected code for **HardwareShopPOS**:
1. **Customer Ordering Website**: 1,478 catalog items, pipe length + cut calculators, mobile cart, customer checkout, and live order tracking.
2. **Android POS Billing Integration**: Real-time incoming web orders queue, instant audio chime, 1-click loading into cashier billing register, and 58mm thermal receipt printing.
3. **GitHub Actions 1-Click APK Builder**: Pre-configured workflow in `.github/workflows/build-apk.yml` that builds `app-debug.apk` directly on GitHub servers for ₹0 free.

---

## 🚀 How to Upload All Files to Your GitHub Repository

### Option A: Using Git Command Line (Recommended)
In your terminal or command prompt inside your project folder:
```bash
# 1. Add all files
git add .

# 2. Commit the changes
git commit -m "Add GitHub Actions APK builder and customer website sync"

# 3. Push to your GitHub repository
git push origin main
```

### Option B: Upload via GitHub Web Browser (No Git required)
1. Open your repository in your browser: [https://github.com/saudmohammed69/HardwareShopPOS](https://github.com/saudmohammed69/HardwareShopPOS)
2. Click **Add file** $\rightarrow$ **Upload files**.
3. Drag and drop the unzipped files (including the `.github` folder) into the browser window.
4. Click **Commit changes** to `main`.

---

## 📱 How to Download the Final Android APK

Once uploaded to GitHub:
1. Go to the **Actions** tab on your GitHub repository: `https://github.com/saudmohammed69/HardwareShopPOS/actions`
2. You will see the workflow **"Build HardwareShopPOS Android APK"** running.
3. Wait ~2–3 minutes for the build to turn green (✅).
4. Click on the completed run and scroll to the bottom **Artifacts** section.
5. Click **HardwareShopPOS-Debug-APK** to download the ready `.apk` file directly to your phone or computer!

---

## 🖨️ 58mm Thermal Printer Settings
- **Roll Width**: 58mm / 57mm (2-inch standard)
- **Line Width**: 32 characters monospace
- **Resolution**: 384 dots/line (203 DPI)
- **Payment**: Includes dynamic UPI QR code for phone scanning
