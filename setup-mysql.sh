#!/bin/bash

echo "🚀 Setup ResumeSection avec MySQL en Docker"
echo "============================================"

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Installer Docker d'abord."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Installer Docker Compose d'abord."
    exit 1
fi

echo "✅ Docker est installé"

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose -f docker-compose.mysql.yml down 2>/dev/null || true

# Lancer MySQL et PhpMyAdmin
echo "🐳 Lancement de MySQL et PhpMyAdmin..."
docker-compose -f docker-compose.mysql.yml up -d

echo "⏳ Attente du démarrage de MySQL..."
sleep 10

# Vérifier la connexion
echo "🔍 Vérification de la connexion MySQL..."
docker-compose -f docker-compose.mysql.yml exec -T mysql mysql -u root -proot_password -e "SELECT 1" &>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ MySQL est prêt !"
else
    echo "❌ Erreur de connexion à MySQL"
    exit 1
fi

# Setup backend
echo ""
echo "📦 Setup du Backend..."
cd backend

# Créer virtualenv si nécessaire
if [ ! -d "venv" ]; then
    echo "🐍 Création de l'environnement Python..."
    python3 -m venv venv
fi

# Activer virtualenv
source venv/bin/activate

# Installer les dépendances
echo "📥 Installation des dépendances..."
pip install -q -r requirements.txt

# Initialiser la base de données
echo "🗄️  Initialisation de la base de données..."
export FLASK_ENV=production
export DATABASE_URL="mysql+pymysql://resumesection_user:resumesection_password@127.0.0.1:3306/resumesection_db"

python3 << 'EOF'
from app import create_app, db
from models import User
from werkzeug.security import generate_password_hash

app = create_app()
with app.app_context():
    # Créer les tables
    db.create_all()
    print("✅ Tables créées avec succès")
    
    # Ajouter les utilisateurs de test
    if not User.query.filter_by(username='admin').first():
        admin = User(
            username='admin',
            password_hash=generate_password_hash('admin123'),
            role='admin'
        )
        db.session.add(admin)
        print("✅ Utilisateur admin créé")
    
    if not User.query.filter_by(username='section1').first():
        section = User(
            username='section1',
            password_hash=generate_password_hash('section123'),
            role='section_manager',
            section_name='Section 1'
        )
        db.session.add(section)
        print("✅ Utilisateur section1 créé")
    
    db.session.commit()
    print("✅ Base de données initialisée avec succès")
EOF

cd ..

echo ""
echo "✅ Setup terminé !"
echo ""
echo "📝 Informations de connexion MySQL :"
echo "   Host: 127.0.0.1"
echo "   Port: 3306"
echo "   User: resumesection_user"
echo "   Password: resumesection_password"
echo "   Database: resumesection_db"
echo ""
echo "🌐 PhpMyAdmin disponible sur: http://localhost:8080"
echo "   User: root"
echo "   Password: root_password"
echo ""
echo "🚀 Pour lancer le backend :"
echo "   cd backend && source venv/bin/activate && python app.py"
echo ""
echo "🌐 Pour lancer le frontend :"
echo "   cd frontend && npm run dev"
