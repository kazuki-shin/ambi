#!/bin/bash

set -e

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo "Node.js is not installed. Please install Node.js (https://nodejs.org/) before proceeding."
  exit 1
fi

# Copy .env.example to .env if not present
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo ".env file created from .env.example. Please fill in the required values."
  else
    echo ".env.example not found. Please create it and re-run this script."
    exit 1
  fi
else
  echo ".env file already exists."
fi

# Install dependencies
if [ -f package.json ]; then
  echo "Installing Node.js dependencies..."
  npm install
else
  echo "package.json not found. Skipping Node.js dependency installation."
fi

# Print next steps
echo "\nSetup complete!"
echo "Next steps:"
echo "1. Fill in your .env file with the required API keys and configuration values."
echo "2. Run 'npm run start' to launch the app."
echo "3. For backend or additional services, follow the documentation in docs/prd.md." 