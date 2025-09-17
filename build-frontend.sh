#!/bin/bash

# Build script for frontend - to be run from project root
echo "Building SMD VITAL Frontend..."

# Navigate to frontend directory
cd horizon-ui-chakra-main

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Current directory: $(pwd)"
    ls -la
    exit 1
fi

# Check if public/index.html exists
if [ ! -f "public/index.html" ]; then
    echo "Error: public/index.html not found. Current directory: $(pwd)"
    ls -la public/
    exit 1
fi

# Set environment variables
export GENERATE_SOURCEMAP=false
export DISABLE_ESLINT_PLUGIN=true
export NODE_ENV=production

# Install dependencies
echo "Installing dependencies..."
npm install

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
