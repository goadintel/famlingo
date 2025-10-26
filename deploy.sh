#!/bin/bash
# FamLingo Web App - Deployment Script
# This script ensures we ALWAYS deploy to the correct directory

set -e  # Exit on error

echo "🚀 FamLingo Deployment Script"
echo "=============================="
echo ""

# Configuration
REMOTE_USER="root"
REMOTE_HOST="128.199.245.225"
REMOTE_PATH="/var/www/famlingo-web/"
SSH_KEY="$HOME/.ssh/famlingo-digitalocean"
BUILD_DIR="dist"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Build
echo "📦 Step 1: Building production bundle..."
npm run build

if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Error: Build directory not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build complete${NC}"
echo ""

# Step 2: Show what will be deployed
echo "📋 Deployment Configuration:"
echo "   Server: $REMOTE_HOST"
echo "   Path: $REMOTE_PATH"
echo "   SSH Key: $SSH_KEY"
echo ""

# Step 3: Confirm deployment
read -p "Deploy to production? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏹️  Deployment cancelled${NC}"
    exit 0
fi

# Step 4: Deploy
echo ""
echo "📤 Step 2: Deploying to DigitalOcean..."
rsync -avz --delete \
    -e "ssh -i $SSH_KEY" \
    $BUILD_DIR/ \
    $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo "🌐 Live at: https://famlingo-api.com"
    echo ""
    echo "💡 Tip: Hard refresh (Ctrl+F5) to see changes"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi
