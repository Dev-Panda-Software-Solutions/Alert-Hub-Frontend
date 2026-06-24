#!/bin/bash
# Backend Integration Setup Script
# Run this script to set up your environment for backend API integration

echo "================================"
echo "Backend Integration Setup"
echo "================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Creating .env file with default configuration..."
  cat > .env << 'EOF'
# React App Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_USE_DUMMY_DATA=false
EOF
  echo "✓ .env file created with default settings"
else
  echo "✓ .env file already exists"
fi

echo ""
echo "Configuration:"
grep REACT_APP .env

echo ""
echo "================================"
echo "Next Steps:"
echo "================================"
echo ""
echo "1. Start your backend server:"
echo "   cd ../mysql/BACKEND"
echo "   npm install"
echo "   npm start"
echo ""
echo "2. Verify backend is running:"
echo "   curl http://localhost:5000/api/health"
echo ""
echo "3. Start the frontend:"
echo "   npm run dev"
echo ""
echo "4. Test the API connection:"
echo "   Visit http://localhost:5174"
echo "   Check browser console for API calls"
echo ""
echo "================================"
