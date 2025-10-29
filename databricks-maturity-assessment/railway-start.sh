#!/bin/bash
set -e

echo "🚀 Starting Databricks Maturity Assessment..."
echo "📍 Current directory: $(pwd)"
echo "📂 Contents: $(ls -la)"

# Ensure we're serving the built client files
if [ ! -d "client/build" ]; then
  echo "❌ ERROR: client/build directory not found!"
  echo "📂 Client directory contents:"
  ls -la client/ || echo "Client directory not found"
  exit 1
fi

echo "✅ Client build found"
echo "🌐 Starting server on port ${PORT:-3000}..."

# Start the Node.js server
NODE_ENV=production node server/index.js

