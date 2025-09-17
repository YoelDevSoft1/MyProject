#!/bin/bash

# Simple build script for frontend
echo "Building SMD VITAL Frontend..."

# Navigate to frontend directory
cd horizon-ui-chakra-main

# Show current directory and contents
echo "Current directory: $(pwd)"
echo "Contents:"
ls -la

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found"
    exit 1
fi

# Check if public directory exists
if [ ! -d "public" ]; then
    echo "Error: public directory not found"
    exit 1
fi

# Check if public/index.html exists
if [ ! -f "public/index.html" ]; then
    echo "Error: public/index.html not found"
    echo "Contents of public directory:"
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
