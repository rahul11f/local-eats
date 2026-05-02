#!/bin/bash

# LocalEats - Quick Start Setup Script
# This script sets up both backend and frontend for local development

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         LocalEats - Quick Start Setup                         ║"
echo "║     Zero Commission Food Delivery for Kahalgaon              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js version: $(node --version)"
echo -e "${GREEN}✓${NC} npm version: $(npm --version)"
echo ""

# Setup Backend
echo -e "${BLUE}📦 Setting up Backend...${NC}"
cd local-eats-server

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit .env with your credentials (MongoDB, Razorpay, etc.)${NC}"
    echo ""
fi

echo "Installing backend dependencies..."
npm install

echo -e "${GREEN}✓${NC} Backend setup complete!"
echo ""

# Setup Frontend
echo -e "${BLUE}📦 Setting up Frontend...${NC}"
cd ../local-eats-client

if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}Creating .env.local file...${NC}"
    cp .env.example .env.local
    echo -e "${YELLOW}⚠️  Please edit .env.local with your API URL and tokens${NC}"
    echo ""
fi

echo "Installing frontend dependencies..."
npm install

echo -e "${GREEN}✓${NC} Frontend setup complete!"
echo ""

# Final instructions
echo "╔════════════════════════════════════════════════════════════════╗"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Configure Environment Variables:"
echo "   - Backend: Edit local-eats-server/.env"
echo "   - Frontend: Edit local-eats-client/.env.local"
echo ""
echo "2. Start MongoDB (if using local MongoDB):"
echo "   docker-compose up -d mongodb"
echo ""
echo "3. Start Backend:"
echo "   cd local-eats-server"
echo "   npm run dev"
echo ""
echo "4. Start Frontend (in a new terminal):"
echo "   cd local-eats-client"
echo "   npm run dev"
echo ""
echo "5. Open http://localhost:3000 in your browser"
echo ""
echo "📚 Documentation:"
echo "   - API Docs: See README.md"
echo "   - Deployment: See docs/DEPLOYMENT.md"
echo "   - Legal: See docs/LEGAL.md"
echo ""
echo "🆘 Need Help?"
echo "   Email: support@localeatskahalgaon.com"
echo ""
