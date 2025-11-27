#!/bin/bash

# Script de vérification et démarrage du projet ResumeSection
# Vérifie les prérequis et lance l'application

set -e

echo "🔍 Vérification de l'environnement ResumeSection..."
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Vérifier Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 non trouvé${NC}"
    exit 1
fi
PYTHON_VERSION=$(python3 --version | awk '{print $2}')
echo -e "${GREEN}✓ Python $PYTHON_VERSION${NC}"

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js non trouvé${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✓ Node.js $NODE_VERSION${NC}"

echo ""
echo -e "${BLUE}📦 Configuration du backend...${NC}"

# Backend setup
if [ ! -d "backend/venv" ]; then
    echo "Création de l'environnement virtuel..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip setuptools wheel
    pip install -r requirements.txt
    cd ..
    echo -e "${GREEN}✓ Backend configuré${NC}"
else
    source backend/venv/bin/activate
    echo -e "${GREEN}✓ Environnement backend existant${NC}"
fi

echo ""
echo -e "${BLUE}📦 Configuration du frontend...${NC}"

# Frontend setup
if [ ! -d "frontend/node_modules" ]; then
    echo "Installation des dépendances..."
    cd frontend
    npm install
    cd ..
    echo -e "${GREEN}✓ Frontend configuré${NC}"
else
    echo -e "${GREEN}✓ Dépendances frontend existantes${NC}"
fi

echo ""
echo -e "${GREEN}✨ Vérification terminée avec succès !${NC}"
echo ""
echo -e "${BLUE}🚀 Pour démarrer l'application:${NC}"
echo ""
echo -e "${YELLOW}Terminal 1 (Backend):${NC}"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python app.py"
echo ""
echo -e "${YELLOW}Terminal 2 (Frontend):${NC}"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo -e "${BLUE}Accès:${NC} http://localhost:5173"
echo -e "${BLUE}Backend:${NC} http://localhost:5000"
echo ""
