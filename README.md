# 🏛️ ResumeSection - Gestion d'Église Évangélique

Application web professionnelle pour gérer et exporter les rapports de sections religieuses avec authentification JWT, génération de PDF, et branding complet.

## ✨ Nouveau : Logo Illustrateur pour Église Évangélique

Un logo professionnel et moderne a été ajouté à l'application :
- 🏛️ **Architecture d'église classique** avec design contemporain
- ✝️ **Croix dorée scintillante** symbolisant le Christ
- 🕊️ **Colombes** représentant le Saint-Esprit
- 🎨 **Palette bleu et or** pour la spiritualité et l'espoir
- 📁 Deux variantes : Complète (avec texte) et Compacte (favicon)

Voir `BRANDING.md` pour plus de détails sur la philosophie et l'utilisation du logo.

## 📋 Fonctionnalités

- **🎨 Branding professionnel** : Logo illustrateur intégré partout
- **🔐 Authentification JWT** : Connexion sécurisée avec tokens JWT
- **👥 Gestion des rôles** : Administrateur, Responsable, Section
- **📝 Création de rapports** : Formulaire complet avec démographie
- **📊 Résumés et statistiques** : Tableau de bord avec KPIs
- **📄 Export PDF** : Génération de rapports avec tableaux professionnels
- **✅ Validation PDF** : Vérification complète des fichiers PDF
- **🎯 Tableau de données** : 12 colonnes avec tri et filtrage en temps réel

## 🏗️ Architecture

### Backend (Flask)
- **Port** : 5000
- **Base de données** : SQLite (dev.db)
- **Authentification** : Flask-JWT-Extended
- **CORS** : Activé pour localhost:5173

### Frontend (React + TypeScript + Vite)
- **Port** : 5173
- **Framework UI** : Radix UI + Tailwind CSS
- **State Management** : React Query
- **Build Tool** : Vite

## 🚀 Installation et Démarrage

### Prérequis
- Python 3.8+
- Node.js 16+ et npm

### Backend

```bash
# Accéder au dossier backend
cd backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur
python app.py
```

Le backend sera accessible à `http://localhost:5000`

### Frontend

```bash
# Accéder au dossier frontend
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Le frontend sera accessible à `http://localhost:5173`

## 📦 Endpoints API

### Authentification
- `POST /register` - Créer un nouvel utilisateur
- `POST /login` - Se connecter

### Rapports
- `POST /report` - Créer un rapport (authentifié)
- `GET /summary` - Obtenir le résumé des rapports (admin)
- `GET /summary/pdf` - Télécharger le résumé en PDF (admin)

### Santé
- `GET /` - Vérifier que le backend fonctionne

## 🔐 Authentification

### Premier utilisateur
Le premier utilisateur peut être créé sans authentification (bootstrap).

```bash
curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password","role":"admin"}'
```

### Connexion
```bash
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

### Utilisation du token
```bash
curl -X GET http://localhost:5000/summary \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📊 Structure des Rapports

Un rapport contient :
- `date` : Date du rapport (YYYY-MM-DD)
- `preacher` : Nom du prédicateur
- `total_attendees` : Nombre total de fidèles
- `men` : Nombre d'hommes
- `women` : Nombre de femmes
- `children` : Nombre d'enfants
- `youth` : Nombre de jeunes
- `offering` : Montant de l'offrande
- `notes` : Notes additionnelles
- `submitted_by` : Utilisateur qui a soumis
- `submitted_at` : Date/heure de soumission

## 🛠️ Développement

### Dépendances Backend
- `flask` : Framework web
- `flask-cors` : Support CORS
- `flask_sqlalchemy` : ORM pour la base de données
- `flask-jwt-extended` : Gestion des JWT
- `reportlab` : Génération de PDF
- `marshmallow` : Validation des données

### Dépendances Frontend
- `react` : Bibliothèque UI
- `react-dom` : Rendu DOM
- `@tanstack/react-query` : Gestion du cache des requêtes
- `tailwindcss` : Framework CSS utilitaire
- `radix-ui` : Composants accessibles
- `sonner` : Notifications
- `lucide-react` : Icônes

## 📝 Logs

- Backend : `backend/backend.log`
- Accès console pendant le développement

## 🔒 Sécurité

- Tokens JWT avec expiration (8 heures par défaut)
- Hachage des mots de passe
- Validation des données entrantes
- CORS configuré pour le développement

## 📄 Fichiers Générés

- `summary.pdf` : Résumé des rapports en PDF
- `test_summary.pdf` : PDF de test
- `test_summary_auth.pdf` : PDF de test avec authentification

## 📚 Structure des Fichiers

```
backend/
├── app.py           # Application Flask principale
├── config.py        # Configuration
├── models.py        # Modèles de base de données
├── report_schema.py # Schéma de validation Marshmallow
├── requirements.txt # Dépendances Python

frontend/
├── src/
│   ├── App.tsx      # Composant principal
│   ├── pages/       # Pages de l'application
│   ├── components/  # Composants réutilisables
│   ├── hooks/       # Hooks personnalisés
│   └── types/       # Types TypeScript
├── package.json     # Configuration npm
└── vite.config.ts   # Configuration Vite
```

## 🐛 Troubleshooting

### CORS Error
Vérifier que le backend s'exécute sur `http://localhost:5000`

### Token Expired
Les tokens expirent après 8 heures. Se reconnecter.

### PDF Generation Failed
Vérifier que reportlab est correctement installé.

## 📧 Support

Pour toute question ou problème, consulter la documentation ou vérifier les logs.
