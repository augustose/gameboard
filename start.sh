#!/bin/bash
set -e

# Print a banner
echo "========================================"
echo "   🚀 Rummy Scorekeeper Local Server"
echo "========================================"

# Check for node_modules and install if missing
if [ ! -d "node_modules" ]; then
    echo "📦 Dependencies not found. Installing..."
    npm install
else
    echo "✅ Dependencies found."
fi

# Check if .env exists (optional warning, since we are doing local-first now it might not be there yet)
if [ ! -f ".env" ]; then
    echo "⚠️  Note: .env file not found. App will run in offline/local-only mode."
fi

echo "🌟 Starting development server..."
echo "👉 Open http://localhost:5173 in your browser"
echo "========================================"

# Start the dev server
npm run dev
