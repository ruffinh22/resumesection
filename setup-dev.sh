#!/bin/bash

echo "🔧 Test de configuration ResumeSection"
echo "======================================"

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
pip install -q -r requirements.txt 2>/dev/null || pip install -r requirements.txt

echo ""
echo "✅ Environnement Python prêt"
echo ""
echo "🗄️  Initialisation de la base de données SQLite (développement)..."

python3 << 'EOF'
from app import create_app, db
from models import User
from werkzeug.security import generate_password_hash

app = create_app()
with app.app_context():
    # Créer les tables
    db.create_all()
    print("✅ Tables créées avec succès")
    
    # Vérifier les utilisateurs existants
    admin_exists = User.query.filter_by(username='admin').first()
    section_exists = User.query.filter_by(username='section1').first()
    
    # Ajouter les utilisateurs de test s'ils n'existent pas
    if not admin_exists:
        admin = User(
            username='admin',
            password_hash=generate_password_hash('admin123'),
            role='admin'
        )
        db.session.add(admin)
        print("✅ Utilisateur admin créé")
    else:
        print("ℹ️  Utilisateur admin existe déjà")
    
    if not section_exists:
        section = User(
            username='section1',
            password_hash=generate_password_hash('section123'),
            role='section_manager',
            section_name='Section 1'
        )
        db.session.add(section)
        print("✅ Utilisateur section1 créé")
    else:
        print("ℹ️  Utilisateur section1 existe déjà")
    
    db.session.commit()
    print("✅ Base de données SQLite prête")
    print("")
    print("📍 Base de données: instance/dev.db")
EOF

echo ""
echo "✅ Configuration terminée !"
echo ""
echo "🚀 Pour lancer le backend en développement :"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python app.py"
echo ""
echo "📝 Identifiants de test :"
echo "   Admin: admin / admin123"
echo "   Section: section1 / section123"
