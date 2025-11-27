# 🗂️ Vue d'ensemble complète - Système de Stats

## 📦 Composants Frontend

### Hiérarchie et dépendances

```
MainApp.tsx
├── Sidebar.tsx [MODIFIÉ - onglet stats]
└── renderContent()
    ├── DashboardPage.tsx [MODIFIÉ]
    │   ├── QuetesTotal.tsx [NEW] ⭐
    │   │   └── useCurrentOffering()
    │   ├── StatsCards.tsx [existant]
    │   ├── WeeklyOfferingStats.tsx [NEW]
    │   │   └── useWeeklyStats()
    │   ├── WeeklyStatsDetail.tsx [NEW]
    │   │   └── useWeeklyStats()
    │   └── ReportsTable.tsx [existant]
    │
    ├── ReportsPage.tsx [existant]
    ├── UsersPage.tsx [existant]
    ├── ExportPage.tsx [existant]
    └── AdminStatsPage.tsx [NEW] ⭐
        └── AdminWeeklyStats.tsx [NEW]
            └── useAllWeeklyStats()
```

---

## 🪝 Hooks React Query

### useWeeklyStats(date?: string)
- **Endpoint**: GET `/weekly-stats?date=YYYY-MM-DD`
- **Retour**: WeeklyStats object
- **Stale time**: 5 minutes
- **Retries**: 2
- **Utilisé par**:
  - WeeklyOfferingStats
  - WeeklyStatsDetail

### useCurrentOffering()
- **Endpoint**: GET `/current-offering`
- **Retour**: CurrentOffering object
- **Stale time**: 2 minutes
- **Retries**: 2
- **Utilisé par**:
  - QuetesTotal

### useAllWeeklyStats(date?: string)
- **Endpoint**: GET `/admin/weekly-stats?date=YYYY-MM-DD`
- **Retour**: WeeklyStats[] array
- **Stale time**: 5 minutes
- **Retries**: 2
- **Utilisé par**:
  - AdminWeeklyStats

### useRefreshStats()
- **Fonction**: Invalide tous les caches
- **Méthodes**:
  - refreshWeeklyStats(date?)
  - refreshCurrentOffering()
  - refreshAll()
- **Appelé après**: Création rapport

---

## 🔌 API Endpoints

### Backend Routes

```
GET  /weekly-stats?date=YYYY-MM-DD
     ├── Auth: ✅ Requis (JWT)
     ├── Role: Section/Responsable/Admin
     ├── Retour: WeeklyStats
     └── Logique: get_or_create_weekly_stats(section_id, date)

GET  /current-offering
     ├── Auth: ✅ Requis (JWT)
     ├── Role: Section/Responsable/Admin
     ├── Retour: CurrentOffering {total_offering, currency, week_start, section_id, msg}
     └── Logique: get_current_week_offering(section_id)

GET  /admin/weekly-stats?date=YYYY-MM-DD
     ├── Auth: ✅ Requis (JWT)
     ├── Role: ⚠️ Admin SEULEMENT
     ├── Retour: WeeklyStats[]
     └── Logique: get_weekly_stats(date)

POST /report [EXISTANT - MODIFIÉ]
     ├── Crée un rapport
     ├── 👉 APPELLE: update_weekly_stats_from_report(report)
     └── Met à jour WeeklyStats auto
```

---

## 🗄️ Modèles de données

### WeeklyStats Model (DB)

```python
class WeeklyStats:
    id                      # PK
    section_id              # FK → User.id
    week_start              # Date (lundi) - INDEXED
    week_end                # Date (dimanche)
    total_offering          # Float [CFA]
    currency                # str = 'XOF'
    total_attendees         # Int
    total_services          # Int (count rapports)
    created_at              # DateTime
    updated_at              # DateTime
    
    # Constraint
    UNIQUE(section_id, week_start)
```

### WeeklyStats Interface (Frontend)

```typescript
interface WeeklyStats {
  id: number;
  section_id: number;
  week_start: string;        // "2025-11-24"
  week_end: string;          // "2025-11-30"
  total_offering: number;    // 1234567
  currency: string;          // "XOF"
  total_attendees: number;   // 500
  total_services: number;    // 4
  created_at: string;        // ISO datetime
  updated_at: string;        // ISO datetime
}
```

### CurrentOffering Interface (Frontend)

```typescript
interface CurrentOffering {
  section_id: number;
  week_start: string;
  total_offering: number;
  currency: string;
  msg: string;
}
```

---

## 📈 Flux de mise à jour

### Scénario: Création de rapport

```
1. User clic "Nouveau Rapport"
   ↓
2. ReportsPage → ReportForm
   ├─ Date: 2025-11-26
   ├─ Prédicateur: Jean
   ├─ Fidèles: 50
   └─ Offrande: 75000
   ↓
3. User soumet form
   ↓
4. Frontend: POST /report
   {
     "date": "2025-11-26",
     "preacher": "Jean",
     "total_attendees": 50,
     "offering": 75000,
     ...
   }
   ↓
5. Backend: app.py /report endpoint
   ├─ Valide données (Marshmallow)
   ├─ Crée Report object
   ├─ Save to DB
   └─ 👉 PUIS: update_weekly_stats_from_report(report)
   ↓
6. weekly_stats.py: update_weekly_stats_from_report()
   ├─ Extrait week_start du rapport (lundi)
   ├─ get_or_create_weekly_stats(section_id=1, date="2025-11-24")
   ├─ Charge WeeklyStats pour semaine
   ├─ total_offering += 75000
   ├─ total_attendees += 50
   ├─ total_services += 1
   └─ Save to DB
   ↓
7. Backend Response 200
   {
     "msg": "Rapport créé",
     "id": 123
   }
   ↓
8. Frontend: Response reçue
   ├─ Affiche Toast "Rapport créé"
   ├─ Invalide queries:
   │  ├─ weekly-stats
   │  ├─ current-offering
   │  └─ all-weekly-stats
   └─ Reset form
   ↓
9. React Query: Détecte invalidation
   ├─ Refetch /weekly-stats
   ├─ Refetch /current-offering
   └─ Refetch /admin/weekly-stats
   ↓
10. Composants se re-rendrent:
    ├─ QuetesTotal: 75000 → 75000 (inchangé) ou 75000 + ancien
    ├─ WeeklyOfferingStats: Total mis à jour
    ├─ WeeklyStatsDetail: 4 métriques mises à jour
    └─ AdminWeeklyStats: Tableau actualisé
    ↓
11. User voit les stats mises à jour en temps réel! ✅
```

---

## 🎨 Composants - Détails affichage

### QuetesTotal
```
┌─────────────────────────────────────────┐
│  📊 Quêtes Totales                      │
│  Semaine en cours                       │
│  ┌──────────────────────────────────┐   │
│  │      1 234 567 F CFA             │   │
│  │           XOF                    │   │
│  └──────────────────────────────────┘   │
│  ─────────────────────────────────────  │
│  Réinitialisation automatique chaque    │
│  lundi                                   │
└─────────────────────────────────────────┘
```

### WeeklyOfferingStats
```
┌─────────────────────────────────────────┐
│  Offrande Total:                        │
│  1 234 567 F CFA                        │
│                                          │
│  Semaine du 24/11/2024 - 01/12/2024    │
└─────────────────────────────────────────┘
```

### WeeklyStatsDetail (4 colonnes)
```
┌─────────────┬────────────┬─────────┬──────────┐
│ Offrande    │ Fidèles    │ Service │ Moy./Sv  │
│ Total       │            │         │          │
├─────────────┼────────────┼─────────┼──────────┤
│ 1,234,567   │ 125        │ 3       │ 411,522  │
│ F CFA       │ personnes  │ rapports│ par rap. │
└─────────────┴────────────┴─────────┴──────────┘

Progression: ███████░░░ (43%)
```

### AdminWeeklyStats (Tableau)
```
┌──────────┬─────────────┬─────────┬──────────┬─────────────┐
│ Section  │ Offrande    │ Fidèles │ Services │ Moy./Sv     │
├──────────┼─────────────┼─────────┼──────────┼─────────────┤
│ Sect. 1  │ 500,000     │ 50      │ 2        │ 250,000     │
│ Sect. 2  │ 750,000     │ 80      │ 2        │ 375,000     │
│ Sect. 3  │ 200,000     │ 30      │ 1        │ 200,000     │
└──────────┴─────────────┴─────────┴──────────┴─────────────┘
TOTAL: 1,450,000 F CFA | 160 fidèles | 5 services
```

---

## 🔐 Contrôle d'accès

| Endpoint | User | Resp | Admin |
|----------|------|------|-------|
| `/weekly-stats` | ✅ Propre section | ✅ | ✅ |
| `/current-offering` | ✅ Propre section | ✅ | ✅ |
| `/admin/weekly-stats` | ❌ | ❌ | ✅ |
| Page `AdminStatsPage` | ❌ | ❌ | ✅ |

---

## 📊 Données de test

### Exemple rapport créé
```json
{
  "date": "2025-11-26",
  "preacher": "Pasteur Jean",
  "total_attendees": 50,
  "men": 20,
  "women": 20,
  "children": 5,
  "youth": 5,
  "offering": 75000,
  "notes": "Service normal"
}
```

### Stats résultantes
```json
{
  "id": 1,
  "section_id": 1,
  "week_start": "2025-11-24",
  "week_end": "2025-11-30",
  "total_offering": 75000,
  "currency": "XOF",
  "total_attendees": 50,
  "total_services": 1,
  "created_at": "2025-11-26T10:30:00",
  "updated_at": "2025-11-26T10:30:00"
}
```

---

## 🔄 Invalidation de cache

### Automatiquement après créer rapport
```typescript
// reportService.createReport() réussit
useRefreshStats().refreshAll()
```

### Manuellement (dev)
```typescript
const { refreshWeeklyStats, refreshAll } = useRefreshStats();

// Rafraîchir stats d'une semaine
refreshWeeklyStats("2025-11-24");

// Rafraîchir tout
refreshAll();
```

---

## ✅ Checklist de test

- [ ] Backend démarre sans erreur
- [ ] Frontend démarre sans erreur
- [ ] Login avec admin/admin123 ✅
- [ ] Dashboard affiche QuetesTotal
- [ ] Création rapport augmente Quêtes Totales
- [ ] Admin voit onglet "Statistiques"
- [ ] Admin peut voir toutes les sections
- [ ] Date picker fonctionne
- [ ] Design responsive sur mobile
- [ ] Erreurs CORS résolues

---

## 📞 Points d'intégration clés

1. **DashboardPage.tsx** - 3 composants stats
2. **MainApp.tsx** - Routing AdminStatsPage
3. **Sidebar.tsx** - Navigation onglet stats
4. **app.py** - 3 endpoints + hook update
5. **models.py** - WeeklyStats model
6. **weekly_stats.py** - Toutes les utilitaires

