# 📊 Système de Statistiques Hebdomadaires - Documentation Complète

## Vue d'ensemble

Le système de statistiques hebdomadaires permet de tracker les offrandes (quêtes) en francs CFA par section chaque semaine, avec réinitialisation automatique le lundi.

---

## 🏗️ Architecture

### Backend

#### 1. **Modèle de données** (`backend/models.py`)
```python
class WeeklyStats(db.Model):
    - id: PK
    - section_id: FK → User.id
    - week_start: Date (lundi)
    - week_end: Date (dimanche)
    - total_offering: Float (en XOF)
    - currency: 'XOF' (francs CFA)
    - total_attendees: Int
    - total_services: Int
    - created_at: DateTime
    - updated_at: DateTime
```

#### 2. **Utilitaires** (`backend/weekly_stats.py`)
- `get_monday_of_week(date)` - Retourne le lundi de la semaine
- `get_sunday_of_week(date)` - Retourne le dimanche de la semaine
- `get_or_create_weekly_stats(section_id, date)` - Récupère ou crée les stats
- `update_weekly_stats_from_report(report)` - Met à jour après création de rapport
- `get_current_week_offering(section_id)` - Retourne le total actuel
- `reset_and_archive_week_stats()` - Réinitialise le lundi (à automatiser)

#### 3. **Endpoints API**

| Endpoint | Méthode | Description | Réponse |
|----------|---------|-------------|---------|
| `/weekly-stats` | GET | Stats de la section actuelle | WeeklyStats |
| `/current-offering` | GET | Offrande totale (section) | CurrentOffering |
| `/admin/weekly-stats` | GET | Stats de toutes les sections | WeeklyStats[] |

### Frontend

#### 1. **Hooks** (`frontend/src/hooks/useWeeklyStats.ts`)
- `useWeeklyStats(date?)` - Récupère les stats hebdomadaires
- `useCurrentOffering()` - Récupère l'offrande courante
- `useAllWeeklyStats(date?)` - Récupère stats (admin)
- `useRefreshStats()` - Invalide les caches
- `formatCFA(amount)` - Formate en francs CFA (XOF)
- `formatWeek(weekStart)` - Formate la plage de dates

#### 2. **Composants**

| Composant | Localisation | Utilisation | Description |
|-----------|--------------|-------------|-------------|
| **QuetesTotal** | `/components/stats/QuetesTotal.tsx` | Dashboard principal | Affiche les Quêtes Totales en grand format (section en haut) |
| **WeeklyOfferingStats** | `/components/stats/WeeklyOfferingStats.tsx` | Dashboard | Affiche l'offrande totale avec détails |
| **WeeklyStatsDetail** | `/components/stats/WeeklyStatsDetail.tsx` | Dashboard | Détails complets (offrande, fidèles, services, moyennes) |
| **AdminWeeklyStats** | `/components/stats/AdminWeeklyStats.tsx` | Page Admin | Tableau comparatif de toutes les sections |

#### 3. **Pages**
- `AdminStatsPage` - Page dédiée aux statistiques admin
- Intégrée dans `MainApp.tsx` via nouvel onglet "Statistiques"

---

## 🎨 Intégration UI

### Dashboard Principal (Utilisateurs)
```
┌─ Tableau de Bord ──────────────────────┐
├─ Quêtes Totales [💹 1 234 567 F CFA]   │ ← QuetesTotal
├─────────────────────────────────────────┤
├─ Cartes de stats (StatsCards)           │
├─────────────────────────────────────────┤
├─ Statistiques Hebdomadaires             │
│  ├─ Weekly Offering Stats               │ ← WeeklyOfferingStats
│  └─ Weekly Stats Detail                 │ ← WeeklyStatsDetail
├─────────────────────────────────────────┤
├─ Tableau des rapports récents           │
└─────────────────────────────────────────┘
```

### Page Admin Stats
```
┌─ Statistiques Hebdomadaires - Admin ────┐
├─ Sélecteur de date/semaine              │
├─────────────────────────────────────────┤
├─ Vue d'ensemble toutes sections         │
│  ├─ Total Général (XOF)                 │
│  ├─ Fidèles Total                       │
│  └─ Services Total                      │
├─────────────────────────────────────────┤
├─ Tableau comparatif sections            │ ← AdminWeeklyStats
│  │ Section │ Offrande │ Fidèles │ ...  │
├─────────────────────────────────────────┤
├─ Analyses (moyennes, tendances)         │
└─────────────────────────────────────────┘
```

### Navigation (Sidebar)
```
Dashboard          [Tous]
Comptes-Rendus     [Tous]
Statistiques       [Admin uniquement] ← NOUVEAU
Utilisateurs       [Admin]
Export PDF         [Admin]
```

---

## 🔄 Flux de données

### Création de rapport → Mise à jour stats
```
1. Utilisateur crée un rapport
   ↓
2. POST /report (backend)
   ↓
3. Report sauvegardé en DB
   ↓
4. update_weekly_stats_from_report() appelée
   ↓
5. WeeklyStats récupérée/créée pour la semaine
   ↓
6. total_offering += offering du rapport
   ↓
7. total_attendees += attendees du rapport
   ↓
8. total_services += 1
   ↓
9. Response 200 {"msg": "Rapport créé", "id": X}
   ↓
10. Frontend invalide cache React Query
   ↓
11. Composants se rafraîchissent automatiquement
```

---

## 📱 Formats et conversions

### Devise
- **Code**: XOF (Francs CFA Ouest africain)
- **Symbole**: F CFA
- **Localisation**: fr-FR
- **Décimales**: 0
- **Exemple**: `formatCFA(1234567)` → "1 234 567 F CFA"

### Dates
- **Format semaine**: "26/11/2024 - 01/12/2024"
- **Lundi**: jour 0 (ISO weekday)
- **Dimanche**: jour 6 (ISO weekday)

---

## ⚙️ Configuration

### Backend
```python
# config.py
SQLALCHEMY_DATABASE_URI = environ.get('DATABASE_URL', 'sqlite:///./instance/dev.db')
JWT_SECRET_KEY = environ.get('JWT_SECRET_KEY', 'dev-key')
```

### Frontend
```typescript
// .env
VITE_API_URL=http://localhost:5000
```

---

## 🔐 Permissions

| Rôle | Actions |
|------|---------|
| **Admin** | Voir toutes les stats, export, page admin |
| **Responsable** | Voir les stats de sa section |
| **Section** | Voir les stats de sa section |

---

## 📊 Cas d'usage

### 1. Responsable de section
- Accède au Dashboard
- Voit **Quêtes Totales** de la semaine en haut
- Consulte les détails (nombre de fidèles, services)
- Soumet des rapports → stats se mettent à jour auto

### 2. Administrateur
- Accède au Dashboard (comme responsable)
- Accède à la page "Statistiques" (admin)
- Voit toutes les sections et leurs stats
- Peut filtrer par semaine
- Consulte les analyses (moyennes, tendances)

### 3. Automatisation (FUTURE)
- Lundi 00:00 → reset des stats hebdomadaires
- Archives semaine précédente
- Crée nouvelles stats pour la nouvelle semaine

---

## 🐛 Dépannage

### Stats ne s'affichent pas
1. Vérifier que `/weekly-stats` retourne 200 OK
2. Vérifier que la section_id dans le JWT est correcte
3. Vérifier que WeeklyStats existe en DB

### Offrandes incorrectes
1. Vérifier que le rapport a un offering > 0
2. Vérifier le calcul dans `update_weekly_stats_from_report()`
3. Vérifier la devise du rapport (doit être 'XOF')

### Cache pas à jour
1. Utiliser `useRefreshStats()` pour invalider
2. Vérifier `staleTime` des hooks (5min pour stats)
3. Vérifier `retry` logic (2 tentatives)

---

## 📝 Checklist d'intégration

- ✅ Modèle WeeklyStats créé
- ✅ Utilitaires weekly_stats.py créés
- ✅ Endpoints API implémentés
- ✅ Hooks React Query créés
- ✅ Composants créés (QuetesTotal, WeeklyOfferingStats, WeeklyStatsDetail)
- ✅ AdminWeeklyStats component créé
- ✅ AdminStatsPage créée
- ✅ Onglet "Statistiques" ajouté au Sidebar
- ✅ MainApp.tsx updated
- ✅ DashboardPage intègre QuetesTotal
- 🟡 Monday reset automation (APScheduler?) - À faire
- 🟡 Archive de données - À faire
- 🟡 Charts/Graphiques - À faire (optionnel)

---

## 🚀 Prochaines étapes

1. **Tester les endpoints**
   ```bash
   curl -H "Authorization: Bearer TOKEN" http://localhost:5000/current-offering
   ```

2. **Valider l'UI frontend**
   - Vérifier affichage des stats
   - Tester refresh après création de rapport
   - Test responsive (mobile/desktop)

3. **Automatisation Monday**
   - Installer APScheduler
   - Créer scheduled task pour reset hebdo

4. **Ajout de graphiques** (optionnel)
   - Historique des offrandes
   - Tendances par section
   - Comparaisons

---

## 📞 Support

Pour des questions sur :
- **Backend**: Voir `backend/weekly_stats.py` et `backend/models.py`
- **Frontend**: Voir `frontend/src/hooks/useWeeklyStats.ts`
- **UI**: Vérifier les composants dans `frontend/src/components/stats/`

