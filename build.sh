#!/bin/bash
set -e

echo "Building NyxBeacon monorepo for Vercel..."

# Build server backend
echo "Building server..."
cd packages/server
npm run build
cd ../..

# Build client frontend  
echo "Building client..."
cd packages/client
npm run build
cd ../..

echo "Build complete!"
