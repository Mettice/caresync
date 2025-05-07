#!/bin/bash

# This script runs both CareSync applications in development mode

# Define colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting CareSync Development Environment${NC}"
echo -e "${BLUE}This will start both the landing page and main application${NC}"

# Start the landing page in one terminal
echo -e "\n${GREEN}Starting Landing Page on port 8080...${NC}"
(cd caresync-ai-landing && npm run dev) &
LANDING_PID=$!

# Wait a bit to avoid interleaved output
sleep 2

# Start the main app in another terminal
echo -e "\n${GREEN}Starting Main Application on port 3000...${NC}"
(cd frontend && npm run dev) &
APP_PID=$!

# Handle graceful shutdown
function cleanup {
  echo -e "\n${GREEN}Shutting down all applications...${NC}"
  kill $LANDING_PID $APP_PID
  exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Keep the script alive
echo -e "\n${GREEN}Both applications are running.${NC}"
echo -e "${BLUE}Access the landing page at:${NC} http://localhost:8080"
echo -e "${BLUE}Access the main app at:${NC} http://localhost:3000"
echo -e "${GREEN}Press Ctrl+C to stop both servers${NC}"

# Wait for user to press Ctrl+C
wait 