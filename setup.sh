#!/bin/bash

# KoolITs POS - Automated Setup Script
# This script automates the installation and setup process

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════╗"
echo "║                                                   ║"
echo "║           KoolITs POS - Setup Script            ║"
echo "║                                                   ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "📥 Please install Node.js from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "📂 Please run this script from the koolits-pos-react directory"
    exit 1
fi

echo "📦 Installing dependencies..."
echo "   This may take a few minutes..."
echo ""

npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Dependencies installed successfully!"
    echo ""
else
    echo ""
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env 2>/dev/null || echo "VITE_API_URL=https://backend-vert-delta-99.vercel.app/api" > .env
    echo "✅ .env file created"
    echo ""
fi

echo "╔═══════════════════════════════════════════════════╗"
echo "║                                                   ║"
echo "║              Setup Complete! 🎉                  ║"
echo "║                                                   ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""
echo "🚀 Quick Start Commands:"
echo ""
echo "   Start Development Server:"
echo "   $ npm run dev"
echo ""
echo "   Build for Production:"
echo "   $ npm run build"
echo ""
echo "   Deploy to Vercel:"
echo "   $ vercel"
echo ""
echo "📚 Documentation:"
echo "   - QUICKSTART.md  - Get started in 5 minutes"
echo "   - README.md      - Full documentation"
echo "   - DEPLOYMENT.md  - Deployment guide"
echo ""
echo "🔐 Default Login Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "⚠️  Important:"
echo "   Make sure the backend API has the admin account created."
echo "   Send POST request to: /api/auth/setup"
echo ""
echo "💡 Need help? Check the documentation files above!"
echo ""
