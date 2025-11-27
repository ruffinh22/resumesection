#!/bin/bash

# Script de test des endpoints API
# Utilisation: ./test-api.sh

set -e

API_BASE="http://localhost:5000"
TOKEN=""

echo "🧪 ResumeSection - API Testing"
echo "================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Health Check
echo -e "${YELLOW}1. Health Check${NC}"
curl -X GET "$API_BASE/" | jq .
echo ""

# Register (First user - bootstrap)
echo -e "${YELLOW}2. Register (Bootstrap - first user)${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testadmin","password":"testpass123","role":"admin"}')
echo "$REGISTER_RESPONSE" | jq .
echo ""

# Login
echo -e "${YELLOW}3. Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"testadmin","password":"testpass123"}')
echo "$LOGIN_RESPONSE" | jq .
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
echo -e "${GREEN}Token: $TOKEN${NC}"
echo ""

# Create Report
echo -e "${YELLOW}4. Create Report${NC}"
REPORT_RESPONSE=$(curl -s -X POST "$API_BASE/report" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date":"2024-01-15",
    "preacher":"Jean Dupont",
    "total_attendees":150,
    "men":60,
    "women":70,
    "children":15,
    "youth":5,
    "offering":500.50,
    "notes":"Service remarquable"
  }')
echo "$REPORT_RESPONSE" | jq .
echo ""

# Get Summary
echo -e "${YELLOW}5. Get Summary (Admin)${NC}"
curl -s -X GET "$API_BASE/summary" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Export PDF
echo -e "${YELLOW}6. Export Summary PDF${NC}"
echo "Downloading PDF..."
curl -s -X GET "$API_BASE/summary/pdf?start=2024-01-01&end=2024-12-31" \
  -H "Authorization: Bearer $TOKEN" \
  -o "test_export.pdf"
echo -e "${GREEN}✓ PDF downloaded: test_export.pdf${NC}"
echo ""

# Register another user (section)
echo -e "${YELLOW}7. Register Section User${NC}"
SECTION_REGISTER=$(curl -s -X POST "$API_BASE/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"section1","password":"section123","role":"section"}')
echo "$SECTION_REGISTER" | jq .
echo ""

# Section user login
echo -e "${YELLOW}8. Section User Login${NC}"
SECTION_LOGIN=$(curl -s -X POST "$API_BASE/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"section1","password":"section123"}')
echo "$SECTION_LOGIN" | jq .
SECTION_TOKEN=$(echo "$SECTION_LOGIN" | jq -r '.access_token')
echo ""

# Section user create report
echo -e "${YELLOW}9. Section User Create Report${NC}"
curl -s -X POST "$API_BASE/report" \
  -H "Authorization: Bearer $SECTION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date":"2024-01-20",
    "preacher":"Marie Martin",
    "total_attendees":120,
    "men":50,
    "women":60,
    "offering":350
  }' | jq .
echo ""

# Get Summary again
echo -e "${YELLOW}10. Get Updated Summary${NC}"
curl -s -X GET "$API_BASE/summary" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo -e "${GREEN}✅ All tests completed!${NC}"
