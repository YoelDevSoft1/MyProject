#!/bin/bash

# Build script for RENDER (Linux compatible)
echo "Building SMD VITAL Frontend..."

# Set environment variables for Linux
export PORT=3000
export GENERATE_SOURCEMAP=false
export DISABLE_ESLINT_PLUGIN=true
export NODE_ENV=production

# Install dependencies
echo "Installing dependencies..."
npm install --production=false

# Build the project
echo "Building React app..."
npm run build

# Verify build
if [ -d "build" ]; then
    echo "Build completed successfully!"
    echo "Build directory contents:"
    ls -la build/
else
    echo "Build failed - no build directory found"
    exit 1
fi
