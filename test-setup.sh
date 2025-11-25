#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=================================================="
echo "  Onboarding Alchemy Platform - Setup Test"
echo "=================================================="
echo ""

# Function to print success message
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error message
error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to print warning message
warning() {
    echo -e "${YELLOW}!${NC} $1"
}

# Check Node.js version
echo "Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    success "Node.js is installed: $NODE_VERSION"
else
    error "Node.js is not installed"
    exit 1
fi

# Check npm version
echo "Checking npm version..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    success "npm is installed: $NPM_VERSION"
else
    error "npm is not installed"
    exit 1
fi

# Check if node_modules exist
echo ""
echo "Checking dependencies..."
if [ -d "node_modules" ] && [ -d "client/node_modules" ] && [ -d "server/node_modules" ]; then
    success "Dependencies are installed"
else
    warning "Dependencies not found. Run 'npm install'"
fi

# Check if .env files exist
echo ""
echo "Checking environment files..."
if [ -f "server/.env" ]; then
    success "server/.env exists"
else
    warning "server/.env not found. Run 'cp server/.env.example server/.env'"
fi

if [ -f "client/.env" ]; then
    success "client/.env exists"
else
    warning "client/.env not found. Run 'cp client/.env.example client/.env'"
fi

# Check if database exists
echo ""
echo "Checking database..."
if [ -f "server/prisma/dev.db" ]; then
    success "Database file exists"
else
    warning "Database not found. Run database setup commands"
fi

# Check if Prisma client is generated
echo ""
echo "Checking Prisma client..."
if [ -d "server/node_modules/@prisma/client" ]; then
    success "Prisma client is generated"
else
    warning "Prisma client not found. Run 'npm run db:generate --workspace=server'"
fi

# Check if server can start (just check if TypeScript compiles)
echo ""
echo "Checking server code..."
if [ -f "server/src/index.ts" ]; then
    success "Server entry point exists"
else
    error "server/src/index.ts not found"
fi

# Check if client can build
echo ""
echo "Checking client code..."
if [ -f "client/src/main.tsx" ]; then
    success "Client entry point exists"
else
    error "client/src/main.tsx not found"
fi

# Check uploads directory
echo ""
echo "Checking uploads directory..."
if [ -d "server/uploads" ]; then
    success "Uploads directory exists"
else
    warning "Uploads directory not found. Run 'mkdir -p server/uploads'"
fi

# Summary
echo ""
echo "=================================================="
echo "  Setup Test Complete"
echo "=================================================="
echo ""
echo "To complete setup, run these commands if needed:"
echo ""
echo "1. Install dependencies:"
echo "   npm install"
echo ""
echo "2. Set up environment:"
echo "   cp server/.env.example server/.env"
echo "   cp client/.env.example client/.env"
echo ""
echo "3. Initialize database:"
echo "   cd server"
echo "   npm run db:generate"
echo "   npm run db:push"
echo "   npm run db:seed"
echo "   cd .."
echo ""
echo "4. Start development:"
echo "   npm run dev"
echo ""
echo "For more details, see QUICKSTART.md"
echo ""
