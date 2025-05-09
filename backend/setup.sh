#!/bin/bash

set -e

# Ambi Project Setup Script
# Run this script after pulling changes to ensure all dependencies are up to date

echo "🚀 Setting up Ambi project..."

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install Node.js (https://nodejs.org/) before proceeding."
  exit 1
fi

# Copy .env.example to .env if not present
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "📝 .env file created from .env.example. Please fill in the required values."
  else
    echo "⚠️ .env.example not found. Please create it and re-run this script."
    exit 1
  fi
else
  echo "✅ .env file already exists."
fi

# Update backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm ci
echo "✅ Backend dependencies installed"

# Run backend linting
echo "🔍 Running backend linting..."
npm run lint
if [ $? -ne 0 ]; then
  echo "⚠️ Backend linting found issues"
else
  echo "✅ Backend linting passed"
fi

# Run backend tests
echo "🧪 Running backend tests..."
npm test
if [ $? -ne 0 ]; then
  echo "⚠️ Backend tests failed"
else
  echo "✅ Backend tests passed"
fi

# Navigate to frontend
cd ../frontend

# Update frontend dependencies
echo "📦 Installing frontend dependencies..."
npm ci
echo "✅ Frontend dependencies installed"

# Run frontend linting
echo "🔍 Running frontend linting..."
npm run lint
if [ $? -ne 0 ]; then
  echo "⚠️ Frontend linting found issues"
else
  echo "✅ Frontend linting passed"
fi

# Run frontend tests
echo "🧪 Running frontend tests..."
npm test
if [ $? -ne 0 ]; then
  echo "⚠️ Frontend tests failed"
else
  echo "✅ Frontend tests passed"
fi

# Return to project root
cd ..

echo "🎉 Setup complete!"
echo "Next steps:"
echo "1. Fill in your .env file with the required API keys and configuration values."
echo "2. Backend server: cd backend && npm run dev"
echo "3. Web app: cd frontend && npm run start"
echo "4. For additional information, see the documentation in docs/prd-new.md."
