#!/bin/bash

# AI Tutor Backend Startup Script
# This script handles environment validation and server startup

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=================================================="
echo "AI Tutor Backend - Startup Script"
echo "=================================================="
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Virtual environment not found. Creating...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Check if requirements are installed
if ! python -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}Dependencies not installed. Installing...${NC}"
    pip install --upgrade pip
    pip install -r requirements.txt
    echo -e "${GREEN}✓ Dependencies installed${NC}"
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo -e "${RED}✗ .env file not found${NC}"
    echo -e "${YELLOW}Please create a .env file with your GROQ_API_KEY${NC}"
    echo "  1. Copy .env.example to .env"
    echo "  2. Add your Groq API key from https://console.groq.com/keys"
    echo ""
    exit 1
fi

# Check for GROQ_API_KEY
source .env
if [ -z "$GROQ_API_KEY" ] || [ "$GROQ_API_KEY" = "your_groq_api_key_here" ] || [ "$GROQ_API_KEY" = "YOUR_GROQ_API_KEY" ]; then
    echo -e "${RED}✗ GROQ_API_KEY not configured${NC}"
    echo -e "${YELLOW}Please set your Groq API key in .env${NC}"
    echo "  Get yours at: https://console.groq.com/keys"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Environment validated${NC}"
echo ""

# Start the server
echo "Starting server on http://0.0.0.0:8000"
echo "API docs: http://0.0.0.0:8000/docs"
echo ""
echo "Press CTRL+C to stop"
echo ""

python main.py
