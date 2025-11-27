#!/bin/bash

# Script de test du système de statistiques hebdomadaires - Version simplifiée
# Usage: bash test-weekly-stats-simple.sh

set -e

API_URL="http://localhost:5000"
TOKEN=""
MAX_RETRIES=3
RETRY_COUNT=0

echo "🧪 Test du système de statistiques hebdomadaires"
echo "=================================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour attendre le serveur
wait_for_server() {
  echo -e "${YELLOW}En attente du serveur...${NC}"
  while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s -m 2 "$API_URL/" > /dev/null 2>&1; then
      echo -e "${GREEN}✓ Serveur prêt${NC}"
      return 0
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    sleep 1
  done
  echo -e "${RED}✗ Serveur non disponible${NC}"
  exit 1
}

wait_for_server

# 1. Login
echo -e "${YELLOW}1. Authentification...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  --connect-timeout 5 \
  --max-time 10)

# Utiliser python pour parser JSON si jq n'existe pas
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('access_token', ''))" 2>/dev/null || echo "")

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
  -d "{\"date\":\"$TODAY\",\"preacher\":\"Test\",\"total_attendees\":50,\"men\":20,\"women\":20,\"children\":5,\"youth\":5,\"offering\":50000,\"notes\":\"Test\"}" \
  --connect-timeout 5 \
  --max-time 10)

REPORT_ID=$(echo "$REPORT_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('id', ''))" 2>/dev/null || echo "")
if [ -z "$REPORT_ID" ]; then
  echo -e "${RED}✗ Erreur création rapport${NC}"
  echo "Response: $REPORT_RESPONSE"
  exit 1
fi
echo -e "${GREEN}✓ Rapport créé (ID: $REPORT_ID)${NC}"
echo ""

# 3. Récupérer les stats
echo -e "${YELLOW}3. Récupération des stats hebdomadaires...${NC}"
STATS_RESPONSE=$(curl -s -X GET "$API_URL/weekly-stats" \
  -H "Authorization: Bearer $TOKEN" \
  --connect-timeout 5 \
  --max-time 10)

TOTAL_OFFERING=$(echo "$STATS_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('total_offering', 0))" 2>/dev/null || echo "0")

if [ "$TOTAL_OFFERING" = "0" ] || [ -z "$TOTAL_OFFERING" ]; then
  echo -e "${RED}✗ Erreur récupération stats${NC}"
  echo "Response: $STATS_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Stats récupérées${NC}"
echo "  - Offrande totale: $TOTAL_OFFERING XOF"
echo ""

# 4. Récupérer l'offrande courante
echo -e "${YELLOW}4. Récupération de l'offrande courante...${NC}"
OFFERING_RESPONSE=$(curl -s -X GET "$API_URL/current-offering" \
  -H "Authorization: Bearer $TOKEN" \
  --connect-timeout 5 \
  --max-time 10)

CURRENT_OFFERING=$(echo "$OFFERING_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('total_offering', ''))" 2>/dev/null || echo "")
if [ -z "$CURRENT_OFFERING" ]; then
  echo -e "${RED}✗ Erreur récupération offrande courante${NC}"
  echo "Response: $OFFERING_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Offrande courante: $CURRENT_OFFERING XOF${NC}"
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
echo ""
echo "✨ Le système de statistiques hebdomadaires fonctionne parfaitement!"
