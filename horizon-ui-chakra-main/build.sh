#!/bin/bash

# Build script for RENDER (Linux compatible)
echo "Building SMD VITAL Frontend..."

# Set environment variables for Linux
export PORT=3000
export GENERATE_SOURCEMAP=false
export DISABLE_ESLINT_PLUGIN=true

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building React app..."
npm run build

echo "Build completed successfully!"
