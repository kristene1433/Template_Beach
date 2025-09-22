#!/bin/bash

echo "🚀 Starting deployment process..."

# Build the React app
echo "📦 Building React app..."
cd client
npm run build
cd ..

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ React build successful"
else
    echo "❌ React build failed"
    exit 1
fi

# Install server dependencies
echo "📦 Installing server dependencies..."
npm install

# Check if server dependencies were installed successfully
if [ $? -eq 0 ]; then
    echo "✅ Server dependencies installed"
else
    echo "❌ Failed to install server dependencies"
    exit 1
fi

# Start the server
echo "🚀 Starting server..."
npm start
