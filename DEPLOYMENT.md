# Guide de Déploiement - ResumeSection

## Production Checklist

### Backend

#### 1. Configuration de Production

```bash
# Créer un fichier .env pour la production
FLASK_ENV=production
FLASK_DEBUG=False
JWT_SECRET_KEY=<utiliser-une-clé-complexe-générée>
DATABASE_URL=<utiliser-MySQL-ou-PostgreSQL>
CORS_ORIGINS=https://votre-domaine.com
```

#### 2. Préparation de la Base de Données

```bash
# Pour MySQL (recommandé en production)
pip install pymysql

# Créer la base de données
mysql -u root -p
> CREATE DATABASE resumesection;
> CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'strong_password';
> GRANT ALL PRIVILEGES ON resumesection.* TO 'app_user'@'localhost';
> FLUSH PRIVILEGES;
```

#### 3. Serveur WSGI

```bash
# Installer Gunicorn
pip install gunicorn

# Lancer l'application
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

#### 4. Serveur Web (Nginx)

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Frontend

#### 1. Build

```bash
cd frontend
npm install
npm run build
```

#### 2. Déploiement (exemple avec Nginx)

```bash
# Copier les fichiers built
cp -r dist/* /var/www/resumesection/

# Configuration Nginx
server {
    listen 80;
    server_name votre-domaine.com;

    root /var/www/resumesection;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://127.0.0.1:5000;
    }
}
```

## Variables d'Environnement Importantes

### Backend

| Variable | Default | Description |
|----------|---------|-------------|
| FLASK_ENV | development | Mode d'exécution |
| FLASK_DEBUG | True | Mode debug |
| JWT_SECRET_KEY | secret | Clé secrète JWT ⚠️ **CHANGER** |
| DATABASE_URL | sqlite:///dev.db | Connection string |
| CORS_ORIGINS | http://localhost:5173 | CORS origins |
| JWT_ACCESS_TOKEN_EXPIRES | 28800 | Expiration token (secondes) |

### Frontend

| Variable | Description |
|----------|-------------|
| VITE_API_URL | URL de base de l'API |

## Sécurité

### Backend

1. **Secret JWT** : Générer une clé complexe
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **HTTPS** : Utiliser Let's Encrypt
   ```bash
   certbot certonly --standalone -d votre-domaine.com
   ```

3. **Rate Limiting** : Ajouter Flask-Limiter
   ```bash
   pip install Flask-Limiter
   ```

4. **Headers de Sécurité** : Ajouter dans Nginx
   ```nginx
   add_header X-Frame-Options "SAMEORIGIN" always;
   add_header X-Content-Type-Options "nosniff" always;
   add_header X-XSS-Protection "1; mode=block" always;
   add_header Referrer-Policy "no-referrer-when-downgrade" always;
   ```

### Données

1. **Backup régulier** de la base de données
2. **Chiffrement** des données sensibles
3. **Audit logs** pour les actions admin

## Monitoring et Logs

### Logs Backend

```bash
# Configuration logrotate
/home/app/backend.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 app app
}
```

### Supervision

- Utiliser `supervisord` ou `systemd` pour gérer les processus
- Implémenter des alertes avec Sentry ou New Relic

## CI/CD

### GitHub Actions (exemple)

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
      
      - name: Build Frontend
        run: cd frontend && npm install && npm run build
      
      - name: Test Backend
        run: |
          cd backend
          pip install -r requirements.txt
          pytest
      
      - name: Deploy
        run: ./scripts/deploy.sh
```

## Rollback Plan

1. Garder versions précédentes des builds
2. Avoir une script de rollback prêt
3. Documenter les ruptures de compatibilité

## Support et Maintenance

### Tâches Régulières

- Vérifier les logs d'erreurs
- Mettre à jour les dépendances
- Nettoyer les données anciennes
- Faire des backups

### Performance

- Monitorer les temps de réponse
- Optimiser les requêtes DB
- Implémenter du caching
- Compresser les assets

## Troubleshooting en Production

### Base de données non accessible
```bash
# Vérifier la connexion
mysql -u app_user -p -h localhost resumesection
```

### Certificat SSL expiré
```bash
certbot renew --force-renewal
```

### Gunicorn pas responsive
```bash
# Redémarrer les workers
supervisorctl restart gunicorn
```
