#!/bin/bash
set -e

echo "=========================================================="
echo " Uploading HardwareShopPOS files to GitHub..."
echo " Repository: https://github.com/saudmohammed69/HardwareShopPOS.git"
echo "=========================================================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Error: git is not installed. Please install git or upload files via GitHub web interface."
    exit 1
fi

git add .
git commit -m "Add GitHub Actions APK builder, website sync, and 58mm printer support" || echo "No new changes to commit."
git push origin main || git push origin master

echo "=========================================================="
echo " Successfully pushed to GitHub!"
echo " GitHub Actions is now building your Android APK:"
echo " https://github.com/saudmohammed69/HardwareShopPOS/actions"
echo "=========================================================="
