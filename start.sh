#!/bin/bash

# Script de démarrage pour ResumeSection
# Usage: ./start.sh

set -e

echo "🚀 Démarrage de ResumeSection..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running from root directory
if [ ! -f "README.md" ]; then
    echo "❌ Veuillez exécuter ce script depuis le dossier racine du projet"
    exit 1
fi

# Backend
echo -e "${BLUE}📦 Configuration du backend...${NC}"
if [ ! -d "backend/venv" ]; then
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    cd ..
    echo -e "${GREEN}✓ Environnement backend créé${NC}"
else
    echo -e "${GREEN}✓ Environnement backend existant${NC}"
fi

# Frontend
echo ""
echo -e "${BLUE}📦 Configuration du frontend...${NC}"
if [ ! -d "frontend/node_modules" ]; then
    cd frontend
    npm install
    cd ..
    echo -e "${GREEN}✓ Dépendances frontend installées${NC}"
else
    echo -e "${GREEN}✓ Dépendances frontend existantes${NC}"
fi

# Instructions de démarrage
echo ""
echo -e "${GREEN}✨ Configuration terminée !${NC}"
echo ""
echo "Pour démarrer l'application, ouvrez deux terminaux :"
echo ""
echo -e "${BLUE}Terminal 1 (Backend):${NC}"
echo "  cd backend"
echo "  source venv/bin/activate  # Windows: venv\\Scripts\\activate"
echo "  python app.py"
echo ""
echo -e "${BLUE}Terminal 2 (Frontend):${NC}"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "L'application sera disponible à: ${BLUE}http://localhost:5173${NC}"
echo ""
echo "Pour la première connexion:"
echo "  Username: admin"
echo "  Password: (que vous définissez lors de la première inscription)"
echo ""
