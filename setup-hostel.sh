#!/bin/bash

# THE BOYS HOSTEL - Quick Setup Script
# This script helps you set up the hostel management system

echo "🏠 THE BOYS HOSTEL - Setup Script"
echo "=================================="
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "✅ .env file already exists"
else
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# THE BOYS HOSTEL - Database Configuration
DATABASE_URL=postgresql://postgres:LQwsyYAHyqKeXaubDhWfZWRNHaCIljYu@turntable.proxy.rlwy.net:25917/railway

# Node Environment
NODE_ENV=development

# Session Secret (generate a secure random string for production)
SESSION_SECRET=your-secret-key-change-this-in-production

# Email Configuration
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@theboyshostel.com

# App Configuration
APP_NAME=THE BOYS HOSTEL
APP_URL=http://localhost:5000

# Port
PORT=5000
EOF
    echo "✅ .env file created"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🗄️  Database Migration"
echo "====================="
echo ""
echo "To run the database migration, choose one of these options:"
echo ""
echo "Option 1: Using psql (if installed)"
echo "  psql postgresql://postgres:LQwsyYAHyqKeXaubDhWfZWRNHaCIljYu@turntable.proxy.rlwy.net:25917/railway -f server/migrations/hostel_transformation.sql"
echo ""
echo "Option 2: Using Railway CLI (if installed)"
echo "  railway run psql \$DATABASE_URL -f server/migrations/hostel_transformation.sql"
echo ""
echo "Option 3: Manual (copy SQL from server/migrations/hostel_transformation.sql)"
echo "  and paste into Railway's database query interface"
echo ""
echo "⚠️  Please run the migration before starting the app!"
echo ""

read -p "Have you run the database migration? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🎨 Logo Update Reminder"
    echo "======================="
    echo "Don't forget to replace these logo files in client/public/:"
    echo "  - CalmKaaj_App_Icon.png"
    echo "  - CalmKaaj_Circular_Logo.png"
    echo "  - CalmKaaj_Orange_Logo.png"
    echo "  - ck-logo.png"
    echo "  - logo-main.png"
    echo ""
    
    echo "🚀 Starting development server..."
    npm run dev
else
    echo ""
    echo "Please run the database migration first, then run:"
    echo "  npm run dev"
    echo ""
fi

