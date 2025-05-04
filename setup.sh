#!/bin/bash

set -e

# Ambi Project Setup Script
# Run this script after pulling changes to ensure all dependencies are up to date

echo "🚀 Setting up Ambi project..."

# Check for Node.js (needed for frontend)
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install Node.js (https://nodejs.org/) before proceeding."
  exit 1
fi

# Check for Python
if ! command -v python3 &> /dev/null; then
  echo "❌ Python 3 is not installed. Please install Python 3.12+ for the backend."
  exit 1
fi

# Check for Poetry
if ! command -v poetry &> /dev/null; then
  echo "⚠️ Poetry is not installed. Installing Poetry for Python dependency management..."
  curl -sSL https://install.python-poetry.org | python3 -
  if [ $? -ne 0 ]; then
    echo "❌ Failed to install Poetry. Please install manually: https://python-poetry.org/docs/#installation"
    exit 1
  fi
  echo "✅ Poetry installed successfully."
fi

# Copy .env.example files to .env if not present
if [ -d "backend" ]; then
  if [ ! -f backend/.env ] && [ -f backend/.env.example ]; then
    cp backend/.env.example backend/.env
    echo "📝 backend/.env file created from .env.example. Please fill in the required values."
  elif [ -f backend/.env ]; then
    echo "✅ backend/.env file already exists."
  else
    echo "⚠️ backend/.env.example not found. Please create it and re-run this script."
  fi
fi

if [ -d "frontend" ]; then
  if [ ! -f frontend/.env ] && [ -f frontend/.env.example ]; then
    cp frontend/.env.example frontend/.env
    echo "📝 frontend/.env file created from .env.example. Please fill in the required values."
  elif [ -f frontend/.env ]; then
    echo "✅ frontend/.env file already exists."
  else
    echo "⚠️ frontend/.env.example not found. Please create it and re-run this script."
  fi
fi

if [ -d "backend" ]; then
  echo -e "\n🐍 Setting up Python backend..."
  cd backend
  
  # Update Python backend dependencies
  echo "📦 Installing Python backend dependencies..."
  poetry install
  if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python backend dependencies"
  else
    echo "✅ Python backend dependencies installed"
  fi
  
  echo "🔍 Running Python linting..."
  poetry run black . --check
  poetry run isort . --check
  if [ $? -ne 0 ]; then
    echo "⚠️ Python linting found issues"
  else
    echo "✅ Python linting passed"
  fi
  
  echo "🧪 Running Python tests..."
  poetry run pytest
  if [ $? -ne 0 ]; then
    echo "⚠️ Python tests failed"
  else
    echo "✅ Python tests passed"
  fi
  
  cd ..
fi

if [ -d "frontend" ]; then
  echo -e "\n📱 Setting up frontend..."
  cd frontend
  
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
  
  cd ..
fi

echo -e "\n🎉 Setup complete!"
echo "Next steps:"
echo "1. Fill in your .env files with the required API keys and configuration values."
echo "2. Python backend server: cd backend && poetry run uvicorn ambi.api.main:app --reload"
echo "3. Web demo: cd frontend && npm run web"
echo "4. iOS app: cd frontend && npm run ios"
echo "5. For additional information, see the documentation in docs/prd.md."
