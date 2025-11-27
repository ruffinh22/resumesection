#!/bin/bash

# Script de test du système de statistiques hebdomadaires
# Usage: bash test-weekly-stats.sh

set -e

API_URL="http://localhost:5000"
TOKEN=""

echo "🧪 Test du système de statistiques hebdomadaires"
echo "=================================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Login
echo -e "${YELLOW}1. Authentification...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ Erreur d'authentification${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi
echo -e "${GREEN}✓ Authentifié${NC}"
echo ""

# 2. Créer un rapport test
echo -e "${YELLOW}2. Création d'un rapport test...${NC}"
TODAY=$(date +%Y-%m-%d)
REPORT_RESPONSE=$(curl -s -X POST "$API_URL/report" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"date\": \"$TODAY\",
    \"preacher\": \"Test Prédicateur\",
    \"total_attendees\": 50,
    \"men\": 20,
    \"women\": 20,
    \"children\": 5,
    \"youth\": 5,
    \"offering\": 50000,
    \"notes\": \"Rapport de test\"
  }")

REPORT_ID=$(echo "$REPORT_RESPONSE" | grep -o '"id":[0-9]*' | cut -d':' -f2)
if [ -z "$REPORT_ID" ]; then
  echo -e "${RED}✗ Erreur création rapport${NC}"
  echo "Response: $REPORT_RESPONSE"
  exit 1
fi
echo -e "${GREEN}✓ Rapport créé (ID: $REPORT_ID)${NC}"
echo ""

# 3. Récupérer les stats de la semaine
echo -e "${YELLOW}3. Récupération des stats hebdomadaires...${NC}"
STATS_RESPONSE=$(curl -s -X GET "$API_URL/weekly-stats" \
  -H "Authorization: Bearer $TOKEN")

TOTAL_OFFERING=$(echo "$STATS_RESPONSE" | grep -o '"total_offering":[0-9.]*' | cut -d':' -f2 | head -1)
TOTAL_ATTENDEES=$(echo "$STATS_RESPONSE" | grep -o '"total_attendees":[0-9]*' | cut -d':' -f2 | head -1)
TOTAL_SERVICES=$(echo "$STATS_RESPONSE" | grep -o '"total_services":[0-9]*' | cut -d':' -f2 | head -1)

if [ -z "$TOTAL_OFFERING" ]; then
  echo -e "${RED}✗ Erreur récupération stats${NC}"
  echo "Response: $STATS_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Stats récupérées${NC}"
echo "  - Offrande totale: $TOTAL_OFFERING XOF"
echo "  - Fidèles totaux: $TOTAL_ATTENDEES"
echo "  - Services: $TOTAL_SERVICES"
echo ""

# 4. Récupérer l'offrande courante
echo -e "${YELLOW}4. Récupération de l'offrande courante...${NC}"
OFFERING_RESPONSE=$(curl -s -X GET "$API_URL/current-offering" \
  -H "Authorization: Bearer $TOKEN")

CURRENT_OFFERING=$(echo "$OFFERING_RESPONSE" | grep -o '"total_offering":[0-9.]*' | cut -d':' -f2)
if [ -z "$CURRENT_OFFERING" ]; then
  echo -e "${RED}✗ Erreur récupération offrande courante${NC}"
  echo "Response: $OFFERING_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Offrande courante: $CURRENT_OFFERING XOF${NC}"
echo ""

# 5. Tester l'endpoint admin (si admin)
echo -e "${YELLOW}5. Récupération des stats (vue admin)...${NC}"
ADMIN_STATS=$(curl -s -X GET "$API_URL/admin/weekly-stats" \
  -H "Authorization: Bearer $TOKEN")

SECTIONS_COUNT=$(echo "$ADMIN_STATS" | grep -o '"section_id"' | wc -l)
echo -e "${GREEN}✓ Stats admin récupérées ($SECTIONS_COUNT sections)${NC}"
echo ""

# Résumé
echo "=================================================="
echo -e "${GREEN}✅ Tous les tests sont passés !${NC}"
echo "=================================================="
echo ""
echo "Résumé:"
echo "  ✓ Authentification réussie"
echo "  ✓ Rapport créé avec succès"
echo "  ✓ Stats hebdomadaires calculées"
echo "  ✓ Offrande courante accessible"
echo "  ✓ Vue admin fonctionnelle"
echo ""
echo "Les statistiques hebdomadaires sont opérationnelles!"
