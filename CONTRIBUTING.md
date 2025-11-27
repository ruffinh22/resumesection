# Contribuer à ResumeSection

Merci de l'intérêt porté à ResumeSection ! Ce guide explique comment contribuer au projet.

## Code de Conduite

- Soyez respectueux et bienveillant
- Acceptez les critiques constructives
- Concentrez-vous sur ce qui est bon pour la communauté

## Mise en Place de l'Environnement de Développement

### 1. Cloner le dépôt

```bash
git clone https://github.com/votre-username/resumesection.git
cd resumesection
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

### 3. Frontend

```bash
cd ../frontend
npm install
```

## Démarrer le Développement

### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate
python app.py
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

L'application sera disponible à `http://localhost:5173`

## Structure du Code

### Backend (`backend/`)

```
backend/
├── app.py              # Application principale & routes
├── config.py           # Configuration
├── models.py           # Modèles SQLAlchemy (User, Report)
├── report_schema.py    # Schéma de validation Marshmallow
├── requirements.txt    # Dépendances
└── instance/
    └── dev.db          # Base SQLite dev
```

### Frontend (`frontend/src/`)

```
src/
├── App.tsx             # Composant racine
├── main.tsx            # Point d'entrée
├── pages/              # Pages principales
│   ├── LoginPage.tsx
│   ├── MainApp.tsx
│   ├── DashboardPage.tsx
│   ├── ReportsPage.tsx
│   ├── ExportPage.tsx
│   └── UsersPage.tsx
├── components/         # Composants réutilisables
│   ├── auth/
│   ├── dashboard/
│   ├── reports/
│   └── ui/
├── hooks/              # Hooks custom
│   └── usePDFValidator.ts
├── types/              # Types TypeScript
└── utils/              # Utilitaires
```

## Conventions de Code

### Python (Backend)

- Utiliser PEP 8
- Noms de fonctions: `snake_case`
- Noms de classes: `PascalCase`
- Documenter avec docstrings

```python
def create_report(data):
    """
    Crée un nouveau rapport.
    
    Args:
        data: Dictionnaire contenant les données du rapport
        
    Returns:
        Report: L'objet rapport créé
        
    Raises:
        ValidationError: Si les données sont invalides
    """
    pass
```

### TypeScript (Frontend)

- Utiliser camelCase pour les variables/fonctions
- Utiliser PascalCase pour les types/interfaces
- Écrire des types explicites

```typescript
interface ReportData {
  id: number;
  date: string;
  total_attendees: number;
}

const fetchReports = async (startDate: string): Promise<ReportData[]> => {
  // ...
}
```

## Processus de Contribution

### 1. Créer une Issue

Avant de faire du code :
- Vérifier que le problème n'existe pas déjà
- Décrire clairement le problème/feature
- Fournir des exemples si possible

### 2. Fork et Créer une Branche

```bash
git checkout -b feature/ma-fonctionnalite
# ou
git checkout -b fix/mon-bug
```

### 3. Faire les Modifications

- Écrire du code lisible et bien commenté
- Respecter les conventions du projet
- Tester vos changements localement

### 4. Tests

```bash
# Backend
cd backend
pytest  # si des tests existent

# Frontend
cd frontend
npm test  # si des tests existent
```

### 5. Commit

```bash
git add .
git commit -m "Brève description du changement

Description plus détaillée si nécessaire.
- Point 1
- Point 2"
```

**Règles de commit :**
- Messages clairs et concis
- Commencer par un verbe (Add, Fix, Update, etc.)
- Référencer les issues: "Fix #123"

### 6. Push et Pull Request

```bash
git push origin feature/ma-fonctionnalite
```

Puis créer une PR sur GitHub avec :
- Description claire du changement
- Lien aux issues relacionadas
- Screenshots si UI changes
- Checklist de vérification

## Domaines de Contribution

### Backend
- [ ] Améliorer la validation des données
- [ ] Ajouter plus de statistiques
- [ ] Optimiser les requêtes
- [ ] Ajouter des tests unitaires
- [ ] Améliorer la documentation de l'API

### Frontend
- [ ] Améliorer l'UI/UX
- [ ] Ajouter plus de visualisations
- [ ] Implémenter le dark mode
- [ ] Améliorer l'accessibilité
- [ ] Ajouter des tests

### Documentation
- [ ] Améliorer le README
- [ ] Ajouter des tutoriels
- [ ] Documenter les APIs
- [ ] Ajouter des exemples

## Questions et Discussions

- Utiliser les Issues pour les questions
- Participer aux Discussions
- Demander des précisions si nécessaire

## Style de PR

### Bon exemple
```
Title: Add PDF validation for downloaded reports

This adds a new hook `usePDFValidator` to validate PDF files
before processing. It checks:
- PDF signature (%PDF-)
- EOF markers (%%EOF)
- File size and MIME type

Fixes #42
```

### Mauvais exemple
```
Title: stuff

changes
```

## Checklist Avant de Soumettre une PR

- [ ] Code testé localement
- [ ] Pas d'erreurs de linting
- [ ] Code commenté si complexe
- [ ] Tests ajoutés/mis à jour
- [ ] Documentation mise à jour
- [ ] Issue linkée
- [ ] Messages de commit clairs

## Questions ?

N'hésitez pas à :
- Ouvrir une Issue
- Commenter sur une PR existante
- Discuter dans les Discussions

Merci de contribuer ! 🙏
