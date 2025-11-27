# Quick Start Guide - ResumeSection

## ⚡ Démarrage Rapide (5 minutes)

### Prérequis
- Python 3.8+
- Node.js 16+
- npm ou yarn

### Étape 1 : Vérifier l'environnement
```bash
chmod +x check-env.sh
./check-env.sh
```

### Étape 2 : Démarrer le Backend

**Terminal 1:**
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python app.py
```

Vérifier: `curl http://localhost:5000/`
Réponse attendue: `{"msg":"ResumeSection backend running","version":"1.0.0"}`

### Étape 3 : Démarrer le Frontend

**Terminal 2:**
```bash
cd frontend
npm run dev
```

Vérifier: Ouvrir `http://localhost:5173` dans le navigateur

### Étape 4 : Tester la Connexion

#### Premier Utilisateur (Bootstrap)
```bash
curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "role": "admin"
  }'
```

#### Se Connecter
```bash
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

Réponse:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "role": "admin",
  "username": "admin",
  "id": 1
}
```

#### Copier le token et tester un endpoint protégé
```bash
TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."

curl -X GET http://localhost:5000/summary \
  -H "Authorization: Bearer $TOKEN"
```

### Étape 5 : Utiliser le Frontend

1. Aller à `http://localhost:5173`
2. Connexion avec: `admin` / `admin123`
3. Créer un rapport dans le formulaire
4. Consulter le tableau de bord

## 🔍 Dépannage

### Backend ne démarre pas
```bash
# Vérifier la version Python
python3 --version

# Vérifier les dépendances
pip install -r requirements.txt

# Supprimer la base SQLite et repartir de zéro
rm backend/instance/dev.db
python app.py
```

### Frontend affiche une erreur CORS
- Vérifier que le backend est en cours d'exécution
- Vérifier l'URL dans `/frontend/.env`
- Vérifier `CORS_ORIGINS` dans `/backend/.env`

### Port déjà utilisé
```bash
# Backend (port 5000)
lsof -i :5000
kill -9 <PID>

# Frontend (port 5173)
lsof -i :5173
kill -9 <PID>
```

### Base de données corrompue
```bash
rm backend/instance/dev.db
# Relancer le backend
```

## 📊 Structure de l'API

### Endpoints Publics
- `GET /` - Health check

### Endpoints Sans Auth
- `POST /register` - Créer un compte
- `POST /login` - Se connecter

### Endpoints Protégés
- `POST /report` - Créer un rapport
- `GET /summary` - Voir tous les rapports (admin)
- `GET /summary/pdf` - Exporter en PDF (admin)

## 🔐 Comptes de Démo

| Compte | Mot de passe | Rôle | Accès |
|--------|-------------|------|-------|
| admin | admin123 | Admin | Tous les rapports |
| section1 | section123 | Section | Ses rapports |
| section2 | section123 | Section | Ses rapports |

## 📝 Format d'un Rapport

```json
{
  "date": "2024-01-15",
  "preacher": "Jean Dupont",
  "total_attendees": 150,
  "men": 60,
  "women": 70,
  "children": 15,
  "youth": 5,
  "offering": 500.50,
  "notes": "Service bien"
}
```

## 🛠️ Commandes Utiles

### Backend
```bash
# Développement
python app.py

# Production
gunicorn -w 4 -b 0.0.0.0:5000 app:create_app()

# Tests
pytest
```

### Frontend
```bash
# Développement
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Tests
npm test
```

## 📚 Documentation Complète
- Voir `README.md` pour le guide complet
- Voir `DEPLOYMENT.md` pour le déploiement
- Voir `API_SPECIFICATION.md` pour l'API détaillée
- Voir `TESTING.md` pour les tests

## 🆘 Besoin d'aide ?
- Consulter les fichiers .md du projet
- Vérifier les logs dans les terminaux
- Vérifier `backend/backend.log` pour les erreurs backend

---

**Maintenant c'est prêt ! Amusez-vous ! 🚀**
