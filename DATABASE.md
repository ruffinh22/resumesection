# 🗄️ Configuration Base de Données - ResumeSection

## Vue d'ensemble

ResumeSection supporte **deux configurations de base de données** :

- **Développement** : SQLite (fichier local, pas de setup)
- **Production** : MySQL (serveur dédié, scalable)

## 🛠️ Développement avec SQLite

### Avantages
✅ Aucune installation requise  
✅ Fichier unique `instance/dev.db`  
✅ Parfait pour le développement local  

### Setup

```bash
cd /home/lidruf/resumesection
./setup-dev.sh
```

Cela va :
1. Créer l'environnement Python
2. Installer les dépendances
3. Créer la base de données SQLite
4. Ajouter les utilisateurs de test

### Utilisation

```bash
cd backend
source venv/bin/activate
python app.py
```

**Identifiants de test** :
- Admin: `admin` / `admin123`
- Section: `section1` / `section123`

---

## 🚀 Production avec MySQL

### Prérequis

```bash
# Installer MySQL Server
# Sur macOS avec Homebrew
brew install mysql

# Sur Ubuntu/Debian
sudo apt install mysql-server

# Sur Windows
# Télécharger depuis https://dev.mysql.com/downloads/mysql/
```

### Configuration

1. **Créer la base de données** :

```bash
mysql -u root -p
```

```sql
CREATE DATABASE resumesection_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'resumesection_user'@'localhost' IDENTIFIED BY 'resumesection_password';
GRANT ALL PRIVILEGES ON resumesection_db.* TO 'resumesection_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

2. **Configurer les variables d'environnement** :

Créer `.env` à la racine du projet :

```bash
FLASK_ENV=production
DATABASE_URL=mysql+pymysql://resumesection_user:resumesection_password@localhost:3306/resumesection_db
SECRET_KEY=your-very-secure-secret-key
JWT_SECRET_KEY=your-very-secure-jwt-key
```

3. **Initialiser la base de données** :

```bash
cd backend
source venv/bin/activate
export FLASK_ENV=production
export DATABASE_URL="mysql+pymysql://resumesection_user:resumesection_password@localhost:3306/resumesection_db"

python3 << 'EOF'
from app import create_app, db
from models import User
from werkzeug.security import generate_password_hash

app = create_app()
with app.app_context():
    db.create_all()
    
    # Ajouter utilisateurs
    admin = User(username='admin', password_hash=generate_password_hash('admin123'), role='admin')
    section = User(username='section1', password_hash=generate_password_hash('section123'), role='section_manager', section_name='Section 1')
    
    db.session.add(admin)
    db.session.add(section)
    db.session.commit()
    print("✅ Base MySQL initialisée")
EOF
```

4. **Lancer le backend** :

```bash
python app.py
```

---

## 🐳 Avec Docker Compose (Recommandé pour Production)

### Utiliser le fichier `docker-compose.mysql.yml`

```bash
docker-compose -f docker-compose.mysql.yml up -d
```

Cela va lancer :
- **MySQL 8.0** sur le port 3306
- **PhpMyAdmin** sur http://localhost:8080

**Identifiants PhpMyAdmin** :
- User: `root`
- Password: `root_password`

---

## 📊 Schéma de la Base de Données

### Table `user`
```sql
CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(80) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'section_manager') NOT NULL,
    section_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table `report`
```sql
CREATE TABLE report (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    section_name VARCHAR(100) NOT NULL,
    preacher_name VARCHAR(100),
    total_attendance INT,
    men INT,
    women INT,
    children INT,
    youth INT,
    offering DECIMAL(10, 2),
    currency VARCHAR(10),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
```

### Table `weekly_stats`
```sql
CREATE TABLE weekly_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    week_start_date DATE NOT NULL,
    total_attendance INT DEFAULT 0,
    men INT DEFAULT 0,
    women INT DEFAULT 0,
    children INT DEFAULT 0,
    youth INT DEFAULT 0,
    total_offering DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_week (user_id, week_start_date),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
```

---

## 🔄 Migration SQLite → MySQL

Si tu dois migrer des données de SQLite vers MySQL :

```bash
# Exporter de SQLite
mysqldump --single-transaction --compatible=mysql \
  -h 127.0.0.1 -u resumesection_user -p resumesection_db \
  > backup.sql

# Importer dans MySQL
mysql -h 127.0.0.1 -u resumesection_user -p resumesection_db < backup.sql
```

---

## 🔐 Bonnes Pratiques

✅ **Développement** : Utiliser SQLite (`instance/dev.db`)  
✅ **Production** : MySQL sur serveur dédié  
✅ **Secrets** : Stocker dans variables d'environnement, jamais dans le code  
✅ **Backups** : Automatiser les backups MySQL quotidiens  
✅ **UTF-8** : Toujours utiliser `utf8mb4` pour MySQL  

---

## 🐛 Troubleshooting

### "Can't connect to MySQL server"

```bash
# Vérifier que MySQL est en cours d'exécution
sudo systemctl status mysql

# Redémarrer MySQL
sudo systemctl restart mysql

# Vérifier la connexion
mysql -u root -p -h localhost -e "SELECT 1;"
```

### "Access denied for user"

```bash
# Vérifier les permissions
mysql -u root -p -e "SHOW GRANTS FOR 'resumesection_user'@'localhost';"

# Réattribuer les permissions
mysql -u root -p -e "GRANT ALL PRIVILEGES ON resumesection_db.* TO 'resumesection_user'@'localhost'; FLUSH PRIVILEGES;"
```

### "SQLAlchemy connection error"

```bash
# Vérifier la DATABASE_URL
echo $DATABASE_URL

# Test direct de la connexion
python3 -c "
import pymysql
try:
    conn = pymysql.connect(host='localhost', user='resumesection_user', password='resumesection_password', database='resumesection_db')
    print('✅ Connexion réussie')
    conn.close()
except Exception as e:
    print(f'❌ Erreur: {e}')
"
```

---

**ResumeSection v1.0.0** | Database Configuration Guide
