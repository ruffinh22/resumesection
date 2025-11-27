# 🚀 Quick Start - Statistiques Hebdomadaires

## ⚡ Démarrage rapide (5 minutes)

### 1️⃣ Démarrer les serveurs

```bash
# Terminal 1 - Backend
cd /home/lidruf/resumesection/backend
source venv/bin/activate
python app.py

# Terminal 2 - Frontend
cd /home/lidruf/resumesection/frontend
npm run dev
```

### 2️⃣ Accéder à l'application

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### 3️⃣ Se connecter

```
Username: admin
Password: admin123
```

---

## 🎯 Voir les Quêtes Totales

1. **Dashboard**: http://localhost:5173/main?tab=dashboard
2. Vous verrez en haut de page: **"Quêtes Totales"** en grand format vert
3. Affiche le total des offrandes de la semaine en francs CFA

---

## 📊 Consulter les stats admin

1. Onglet "Statistiques" dans le sidebar (admin seulement)
2. Voir toutes les sections et leurs totaux
3. Sélectionner une semaine avec le date picker

---

## ✅ Vérifications rapides

### Via le navigateur
```
GET http://localhost:5000/weekly-stats
Authorization: Bearer YOUR_TOKEN
```

### Via le script de test
```bash
cd /home/lidruf/resumesection
bash test-weekly-stats.sh
```

---

## 🔄 Tester le flux complet

1. Dashboard → "Comptes-Rendus" (tab reports)
2. Créer un nouveau rapport
   - Date: aujourd'hui
   - Prédicateur: "Test"
   - Fidèles: 50
   - Offrande: 100000 XOF
3. Soumettre
4. Retour au Dashboard
5. **Quêtes Totales se mettent à jour automatiquement!**

---

## 📁 Fichiers clés

| Fichier | Fonction |
|---------|----------|
| `backend/weekly_stats.py` | Calculs hebdo |
| `frontend/src/hooks/useWeeklyStats.ts` | React Query hooks |
| `frontend/src/components/stats/QuetesTotal.tsx` | Affichage principal |
| `frontend/src/pages/AdminStatsPage.tsx` | Admin page |

---

## 🆘 Troubleshooting

### Quêtes Totales ne s'affiche pas
- [ ] Vérifier que backend répond: `curl http://localhost:5000/`
- [ ] Vérifier token JWT valide
- [ ] Vérifier Console Dev (F12) pour erreurs

### Pas de données
- [ ] Créer au moins 1 rapport
- [ ] Vérifier dans DB: `SELECT * FROM weekly_stats;`

### Erreur CORS
- [ ] Backend a CORS activé? Vérifier `app.py`
- [ ] Frontend `.env` a `VITE_API_URL=http://localhost:5000`?

---

## 📞 Support

Besoin d'aide?
- Lire: `WEEKLY_STATS_DOCUMENTATION.md`
- Vérifier: `WEEKLY_STATS_RECAP.md`
- Tester: `test-weekly-stats.sh`

