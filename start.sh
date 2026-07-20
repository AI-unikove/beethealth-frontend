#!/bin/bash

# Beet Health Frontend - Quick Start Script
# This script helps you get started quickly

echo "🎉 Welcome to Beet Health Frontend!"
echo "===================================="
echo ""

# Check Node.js version
echo "📋 Checking Node.js version..."
NODE_VERSION=$(node -v)
echo "Current Node.js version: $NODE_VERSION"
echo ""

# Extract major version
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')

if [ $NODE_MAJOR -lt 20 ]; then
    echo "⚠️  WARNING: Node.js version 20+ is required!"
    echo "You have version $NODE_VERSION"
    echo ""
    echo "Please upgrade using nvm:"
    echo "  nvm install 20"
    echo "  nvm use 20"
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

echo "✅ Node.js version is compatible!"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully!"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOL
# Beet Health Environment Variables
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=Beet Health
VITE_APP_VERSION=1.0.0
EOL
    echo "✅ .env file created!"
fi
echo ""

# Show available commands
echo "🚀 Ready to start!"
echo ""
echo "Available commands:"
echo "  npm run dev      - Start development server"
echo "  npm run build    - Build for production"
echo "  npm run preview  - Preview production build"
echo "  npm run lint     - Run ESLint"
echo "  npm run format   - Format code with Prettier"
echo ""

# Ask if user wants to start dev server
read -p "Would you like to start the development server now? (y/n): " answer

if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
    echo ""
    echo "🚀 Starting development server..."
    echo "Server will be available at: http://localhost:5173"
    echo ""
    npm run dev
else
    echo ""
    echo "👋 To start the server later, run: npm run dev"
    echo ""
fi
