# 🚀 Guide de Déploiement - ResumeSection

## Configuration GitHub

### Créer le repository

1. Allez sur [GitHub](https://github.com/new)
2. Créez un nouveau repository : `resumesection`
3. **NE PAS** initialiser avec README (on a déjà un README local)

### Pousser le code

```bash
cd /home/lidruf/resumesection

# Ajouter le remote
git remote add origin https://github.com/ruffinh22/resumesection.git

# Renommer main (optionnel)
git branch -M main

# Pousser le code
git push -u origin main
```

## 🌐 Déploiement Backend (Production)

### Option 1 : Deployment sur Heroku (Gratuit avec limites)

```bash
# Installer Heroku CLI
curl https://cli.heroku.com/install.sh | sh

# Se connecter
heroku login

# Créer l'app
heroku create resumesection-api

# Ajouter le remote Heroku
git remote add heroku https://git.heroku.com/resumesection-api.git

# Créer Procfile
echo "web: cd backend && python app.py" > Procfile

# Ajouter requirements.txt si manquant
cd backend && pip freeze > requirements.txt

# Commiter et pousser
git add .
git commit -m "Add Heroku deployment config"
git push heroku main
```

### Option 2 : Deployment sur Railway.app (Recommandé)

```bash
# 1. Créer compte sur https://railway.app

# 2. Installer Railway CLI
npm i -g @railway/cli

# 3. Se connecter
railway login

# 4. Initialiser le projet
railway init

# 5. Déployer
railway up
```

### Option 3 : Deployment local/VPS

```bash
# Sur le serveur
cd /opt/resumesection

# Cloner le repo
git clone https://github.com/ruffinh22/resumesection.git .

# Setup backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup database
python app.py  # Créera dev.db

# Lancer avec gunicorn (production)
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:create_app()

# Ou avec Supervisor pour daemon
sudo apt install supervisor
# Créer /etc/supervisor/conf.d/resumesection.conf
```

## 🌐 Déploiement Frontend (Production)

### Option 1 : Vercel (Gratuit)

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Build et deploy
cd frontend
vercel
```

### Option 2 : Netlify (Gratuit)

```bash
# Installer Netlify CLI
npm i -g netlify-cli

# Se connecter
netlify login

# Déployer
cd frontend
netlify deploy --prod --dir=dist
```

### Option 3 : GitHub Pages

```bash
# Ajouter dans vite.config.ts
export default {
  base: '/resumesection/',
  // ...
}

# Build
npm run build

# Ajouter dans package.json
"deploy": "gh-pages -d dist"

# Installer et déployer
npm install --save-dev gh-pages
npm run deploy
```

### Option 4 : Nginx sur VPS

```bash
# Sur le serveur
cd /var/www/resumesection

# Cloner et builder
git clone https://github.com/ruffinh22/resumesection.git
cd resumesection/frontend
npm install
npm run build

# Configurer Nginx
sudo nano /etc/nginx/sites-available/resumesection

# Contenu :
server {
    listen 80;
    server_name resumesection.com;

    root /var/www/resumesection/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Activer le site
sudo ln -s /etc/nginx/sites-available/resumesection /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL avec Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d resumesection.com
```

## 🔧 Configuration Variables Environnement

### Backend (.env)

```
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=votre_secret_key_complexe
JWT_SECRET_KEY=votre_jwt_secret_complexe
DATABASE_URL=sqlite:///prod.db
CORS_ORIGINS=https://resumesection.com
LOG_LEVEL=INFO
```

### Frontend (.env)

```
VITE_API_BASE=https://api.resumesection.com
VITE_APP_NAME=ResumeSection
```

## 📊 Configuration Database

### Production avec PostgreSQL

```bash
# Backend requirements.txt
psycopg2-binary==2.9.9
SQLAlchemy==2.0.23
Flask-SQLAlchemy==3.1.1

# config.py
import os
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost/resumesection_db')

# Pour Heroku, c'est automatique
```

## 🔒 SSL/HTTPS

### Let's Encrypt (Gratuit)

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d resumesection.com

# Renouvellement auto
sudo systemctl enable certbot.timer
```

## 📈 Monitoring

### Uptime Monitoring
- https://uptimerobot.com (gratuit)

### Logs et Sentry
```bash
pip install sentry-sdk

# Dans app.py
import sentry_sdk
sentry_sdk.init("votre_sentry_dsn")
```

### Analytics
- Google Analytics
- Mixpanel
- Amplitude

## 🚨 Backup & Recovery

```bash
# Backup database
sqlite3 backend/dev.db ".backup backup.db"

# Restore
sqlite3 backend/dev.db ".restore backup.db"

# Auto-backup cron job
0 2 * * * sqlite3 /opt/resumesection/backend/dev.db ".backup /backups/resumesection_$(date +\%Y\%m\%d).db"
```

## 🔄 CI/CD avec GitHub Actions

Créer `.github/workflows/deploy.yml` :

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.13.15
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "resumesection-api"
          heroku_email: ${{secrets.HEROKU_EMAIL}}
```

## ✅ Checklist Pré-production

- [ ] Variables d'environnement configurées
- [ ] Base de données en production
- [ ] SSL/HTTPS activé
- [ ] CORS bien configuré
- [ ] JWT secrets générés
- [ ] Logs activés
- [ ] Backups configurés
- [ ] Monitoring en place
- [ ] Tests en production
- [ ] Documentation à jour

## 📞 Troubleshooting

### CORS Error
```bash
# Backend config.py
CORS_ORIGINS = ['https://frontend-url.com']
```

### JWT Token Expired
```bash
# Allonger la durée
JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
```

### Database Connection
```bash
# Vérifier la string de connexion
python -c "from app import create_app; app = create_app(); print(app.config['SQLALCHEMY_DATABASE_URI'])"
```

### Port en utilisation
```bash
lsof -i :5000  # Trouver le processus
kill -9 <PID>  # Tuer le processus
```

---

**ResumeSection v1.0.0** | Deployment Guide
