#!/bin/bash

# CoP Portal - Launch with Local PostgreSQL (No Docker Required)

echo "=========================================="
echo "  CoP Portal - Setup (Local PostgreSQL)"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed${NC}"
    echo ""
    echo "Please install PostgreSQL:"
    echo "  brew install postgresql@16"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL found${NC}"

# Start PostgreSQL service
echo "Starting PostgreSQL service..."
brew services start postgresql@16 2>/dev/null || brew services start postgresql 2>/dev/null

sleep 3

# Create database and user
echo "Creating database..."
psql postgres -c "CREATE DATABASE cop_portal;" 2>/dev/null || echo "Database may already exist"
psql postgres -c "CREATE USER cop_user WITH PASSWORD 'cop_password';" 2>/dev/null || echo "User may already exist"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE cop_portal TO cop_user;" 2>/dev/null
psql postgres -c "ALTER DATABASE cop_portal OWNER TO cop_user;" 2>/dev/null

echo -e "${GREEN}✅ Database ready${NC}"
echo ""

# Update DATABASE_URL for local PostgreSQL
echo "Configuring backend..."
cd backend
cat > .env << EOF
DATABASE_URL="postgresql://cop_user:cop_password@localhost:5432/cop_portal?schema=public"
JWT_SECRET="dev-secret-key-change-in-production"
NODE_ENV="development"
EOF

# Install and setup backend
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

echo "Generating Prisma client..."
npm run prisma:generate

echo "Running migrations..."
npx prisma migrate dev --name init

echo "Seeding database..."
npm run prisma:seed

echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Copy the user ID printed above!${NC}"
echo ""
read -p "Enter the user ID from above: " USER_ID

# Setup frontend
echo "Setting up frontend..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

cat > .env.local << EOF
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_FAKE_USER_ID=${USER_ID}
EOF

echo ""
echo "=========================================="
echo -e "  ${GREEN}✅ Setup Complete!${NC}"
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


