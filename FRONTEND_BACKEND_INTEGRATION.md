# 🔗 Frontend-Backend Integration Guide

## Vue d'Ensemble

Le frontend React/TypeScript est maintenant **complètement intégré** au backend Flask avec :

- ✅ Client API centralisé (`apiClient`)
- ✅ Services API pour authentification et rapports
- ✅ Hooks personnalisés pour les requêtes (`useQuery`, `useMutation`)
- ✅ Gestion des erreurs cohérente
- ✅ Support du mode démo (fallback quand le backend est indisponible)

---

## Architecture API

### 1. Client API Central (`src/api/client.ts`)

```typescript
import { apiClient } from '@/api/client';

// GET Request
const data = await apiClient.get('/summary', { start: '2024-01-01' });

// POST Request
const result = await apiClient.post('/report', { date, preacher, total_attendees });

// Fichier (Blob)
const pdf = await apiClient.getBlob('/summary/pdf');

// Gestion du token
apiClient.setToken(token);
const currentToken = apiClient.getToken();
```

### 2. Services API

#### Authentication (`src/api/auth.ts`)
```typescript
import { authService } from '@/api/auth';

// Login
const response = await authService.login(username, password);
// → { access_token: "...", role: "admin" }

// Register
await authService.register({ username, password, role: 'section' });

// Health Check
await authService.health();
// → { msg: "ResumeSection backend running" }
```

#### Reports (`src/api/reports.ts`)
```typescript
import { reportService } from '@/api/reports';

// Create Report
await reportService.createReport({
  date: '2024-01-15',
  preacher: 'Jean Dupont',
  total_attendees: 150,
  offering: 500
});

// Get Summary (Admin)
const reports = await reportService.getSummary({
  start: '2024-01-01',
  end: '2024-12-31'
});

// Export PDF
const pdfBlob = await reportService.exportPDF({ start, end });
```

### 3. Hooks Personnalisés (`src/api/hooks.ts`)

#### useAsync - Requête générique
```typescript
import { useAsync } from '@/api/hooks';

const { data, loading, error, execute, reset } = useAsync(
  () => reportService.getSummary(),
  true // immediate execution
);
```

#### useQuery - GET avec cache
```typescript
import { useQuery } from '@/api/hooks';

const { data: reports, loading, refetch } = useQuery(
  'reports',
  () => reportService.getSummary(),
  { staleTime: 5 * 60 * 1000 } // 5 min cache
);
```

#### useMutation - POST/PUT/DELETE
```typescript
import { useMutation } from '@/api/hooks';

const { mutate, loading, error, isSuccess } = useMutation(
  (data) => reportService.createReport(data)
);

const handleSubmit = async (formData) => {
  await mutate(formData);
  if (isSuccess) {
    console.log('✓ Rapport créé');
  }
};
```

---

## Flow d'Authentification

```
┌─────────────────────────────────────────┐
│   LoginPage                             │
│  ┌───────────────────────────────────┐  │
│  │ username: "admin"                 │  │
│  │ password: "admin123"              │  │
│  └───────────────────────────────────┘  │
└──────────────┬──────────────────────────┘
               │ login(username, password)
               ▼
        ┌──────────────────┐
        │  authService     │
        │  .login()        │
        └────────┬─────────┘
                 │
        ┌────────▼─────────┐
        │  apiClient.post  │ POST /login
        │  ('/login')      │
        └────────┬─────────┘
                 │
        ┌────────▼──────────────────────────────┐
        │  Backend Response                     │
        │  {                                    │
        │    "access_token": "eyJhbGci...",   │
        │    "role": "admin"                   │
        │  }                                    │
        └────────┬──────────────────────────────┘
                 │
        ┌────────▼─────────────────────┐
        │  AuthProvider                │
        │  - setToken(token)           │
        │  - setUser(user)             │
        │  - localStorage              │
        └────────┬─────────────────────┘
                 │
        ┌────────▼──────────────┐
        │  Redirect to MainApp  │
        └───────────────────────┘
```

### Fallback Mode (Backend Indisponible)

```
┌──────────────────────────────┐
│  login() attempt             │
│  ↓ fetch('/login') FAILS     │
└───────────────┬──────────────┘
                │
        ┌───────▼────────────────────┐
        │  Try Mock Users:           │
        │  username: "admin"         │
        │  password: "admin123"      │
        └───────┬────────────────────┘
                │ Match Found? YES
        ┌───────▼──────────────┐
        │  Mock Login Success  │
        │  ℹ️ Mode démo actif   │
        └──────────────────────┘
```

---

## Configuration

### Variables d'Environnement (`frontend/.env`)

```bash
# Backend API endpoint
VITE_API_BASE=http://localhost:5000

# Optionnel
VITE_API_TIMEOUT=10000
VITE_DEBUG_API=true
```

### Setup Initial

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## Utilisation dans les Composants

### Exemple 1: Page de Connexion

```tsx
import { useAuth } from '@/api';

const LoginPage = () => {
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      // Redirect to dashboard
      navigate('/dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={isLoading}
      />
      <input
        type="password"
        placeholder="Password"
        disabled={isLoading}
      />
      {error && <Alert>{error}</Alert>}
      <button disabled={isLoading}>
        {isLoading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  );
};
```

### Exemple 2: Formulaire de Rapport

```tsx
import { useMutation } from '@/api/hooks';
import { reportService } from '@/api';

const ReportForm = () => {
  const { mutate, loading, error, isSuccess } = useMutation(
    (data) => reportService.createReport(data)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await mutate(formData);
      console.log('Rapport créé:', result);
      // Reset form
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={loading}>
        {loading ? 'Création...' : 'Créer'}
      </button>
      {error && <div className="error">{error.msg}</div>}
      {isSuccess && <div className="success">✓ Succès!</div>}
    </form>
  );
};
```

### Exemple 3: Affichage des Rapports

```tsx
import { useQuery } from '@/api/hooks';
import { reportService } from '@/api';

const ReportsList = () => {
  const { data: reports, loading, error, refetch } = useQuery(
    'reports-summary',
    () => reportService.getSummary({ start: '2024-01-01' }),
    { staleTime: 5 * 60 * 1000 }
  );

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur: {error.msg}</p>;

  return (
    <div>
      {reports?.map(report => (
        <div key={report.id}>
          <h3>{report.date} - {report.preacher}</h3>
          <p>Total: {report.total_attendees}</p>
        </div>
      ))}
      <button onClick={refetch}>Rafraîchir</button>
    </div>
  );
};
```

### Exemple 4: Export PDF

```tsx
const ExportButton = ({ startDate, endDate }) => {
  const { mutate, loading } = useMutation(
    (params) => reportService.exportPDF(params)
  );

  const handleExport = async () => {
    const pdfBlob = await mutate({ start: startDate, end: endDate });
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summary.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={handleExport} disabled={loading}>
      {loading ? 'Export...' : 'Télécharger PDF'}
    </button>
  );
};
```

---

## Gestion des Erreurs

### Structure d'erreur API

```typescript
interface ApiError {
  msg: string;              // Message d'erreur principal
  error?: string;           // Détails additionnels
  errors?: {                // Erreurs de validation
    [field: string]: string[]
  };
  status: number;           // Code HTTP
}
```

### Récupération d'erreurs

```tsx
const { mutate, error } = useMutation(reportService.createReport);

if (error) {
  console.log(error.msg);        // "Validation error"
  console.log(error.errors);     // { preacher: ["Required field"] }
  console.log(error.status);     // 422
}
```

---

## Testing

### Test de Connexion

```bash
# Démarrer le backend
cd backend && python app.py

# Démarrer le frontend
cd frontend && npm run dev

# Aller à http://localhost:5173
# Login avec: admin / admin123
```

### Mode Démo

```bash
# Sans backend
cd frontend && npm run dev

# Login avec: admin / admin123
# → Affiche "ℹ️ Mode démo (backend indisponible)"
```

### Test API Direct

```bash
# Login
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Créer rapport (avec token)
curl -X POST http://localhost:5000/report \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date":"2024-01-15",
    "preacher":"Jean Dupont",
    "total_attendees":150
  }'
```

---

## Performance & Caching

### Query Caching

```tsx
// Première requête → API call
const { data } = useQuery('key', fetchFn, { staleTime: 5000 });

// Requêtes suivantes (< 5s) → Cache
// Après 5s → Marqé comme "stale"
// Nouvelle requête → API call

// Force refresh
refetch();
```

### Optimisations

- ✅ Cache localStorage pour les requêtes GET
- ✅ Debouncing des mutations
- ✅ Lazy loading des composants
- ✅ Code splitting automatique (Vite)

---

## Troubleshooting

### ❌ CORS Error
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution:** Vérifier que le backend a CORS activé:
```python
CORS(app, origins=["http://localhost:5173"])
```

### ❌ Token Expired
```
{ "msg": "Token expiré" }
```
**Solution:** Se reconnecter pour obtenir un nouveau token

### ❌ Backend Not Reachable
```
Failed to fetch from http://localhost:5000
```
**Solutions:**
- Vérifier que le backend s'exécute: `python app.py`
- Vérifier le port: 5000
- Vérifier VITE_API_BASE dans .env

### ✅ Mode Démo Activé
```
ℹ️ Mode démo (backend indisponible). Connexion avec compte local.
```
**Explanation:** Le backend n'est pas accessible, utilisant les mock users

---

## Checklist d'Intégration

- [x] Client API centralisé
- [x] Services d'authentification
- [x] Services de rapports
- [x] Hooks personnalisés (useQuery, useMutation)
- [x] Gestion des erreurs cohérente
- [x] Support du mode démo
- [x] Configuration d'environnement
- [x] AuthProvider amélioré
- [x] LoginPage optimisée
- [x] Caching des requêtes
- [x] Documentation complète

**Status:** ✅ **INTÉGRATION COMPLÈTE**

---

## Prochaines Étapes (Optionnel)

1. Ajouter des **tests unitaires** pour les services API
2. Implémenter **React Query** pour un caching plus avancé
3. Ajouter **Sentry** pour la gestion des erreurs en production
4. Implémenter **refresh tokens** pour la sécurité
5. Ajouter des **notifications** avec Sonner

---

**Version:** 1.0.0  
**Dernière mise à jour:** 26 novembre 2024
