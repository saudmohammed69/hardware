@echo off
echo ==========================================================
echo  Uploading HardwareShopPOS files to GitHub...
echo  Repository: https://github.com/saudmohammed69/HardwareShopPOS.git
echo ==========================================================

git add .
git commit -m "Add GitHub Actions APK builder, website sync, and 58mm printer support"
git push origin main

echo ==========================================================
echo  Successfully pushed to GitHub!
echo  GitHub Actions is now building your Android APK:
echo  https://github.com/saudmohammed69/HardwareShopPOS/actions
echo ==========================================================
pause
