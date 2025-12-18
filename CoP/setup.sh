#!/bin/bash

# CoP Portal - Local Setup Script
# This script sets up and launches the entire application locally

set -e  # Exit on error

echo "=========================================="
echo "  CoP Portal - Local Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker is required but not installed. Please install Docker Desktop.${NC}" >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js is required but not installed. Please install Node.js 18+.${NC}" >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}❌ npm is required but not installed.${NC}" >&2; exit 1; }

echo -e "${GREEN}✅ All prerequisites met${NC}"
echo ""

# Start PostgreSQL
echo "🐘 Starting PostgreSQL database..."
docker compose up -d db

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Check if database is ready
until docker compose exec -T db pg_isready -U cop_user -d cop_portal >/dev/null 2>&1; do
  echo "   Waiting for database..."
  sleep 2
done

echo -e "${GREEN}✅ Database is ready${NC}"
echo ""

# Backend setup
echo "🔧 Setting up backend..."
cd backend

if [ ! -d "node_modules" ]; then
  echo "   Installing backend dependencies..."
  npm install
else
  echo "   Dependencies already installed"
fi

echo "   Generating Prisma client..."
npm run prisma:generate

echo "   Running database migrations..."
npm run prisma:migrate -- dev --name init

echo "   Seeding database..."
npm run prisma:seed

echo -e "${GREEN}✅ Backend setup complete${NC}"
echo ""

# Frontend setup
echo "🎨 Setting up frontend..."
cd ../frontend

if [ ! -d "node_modules" ]; then
  echo "   Installing frontend dependencies..."
  npm install
else
  echo "   Dependencies already installed"
fi

echo -e "${GREEN}✅ Frontend setup complete${NC}"
echo ""

# All done
echo ""
echo "=========================================="
echo "  ✅ Setup Complete!"
echo "=========================================="
echo ""
echo "🚀 To start the application:"
echo ""
echo "   Terminal 1 - Backend:"
echo "   cd backend && npm run start:dev"
echo ""
echo "   Terminal 2 - Frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "📱 Then open: http://localhost:3000"
echo ""
echo "=========================================="


