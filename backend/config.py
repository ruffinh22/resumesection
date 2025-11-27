import os
from datetime import timedelta
import sys

# Chemin absolu du dossier backend
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INSTANCE_DIR = os.path.join(BASE_DIR, 'instance')

# Créer le dossier instance s'il n'existe pas
os.makedirs(INSTANCE_DIR, exist_ok=True)

class Config:
    """Configuration de l'application Flask"""
    
    # Clé secrète pour les sessions
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Database Configuration
    # En développement: SQLite (par défaut)
    # En production: MySQL (via DATABASE_URL)
    if os.environ.get('FLASK_ENV') == 'production':
        # Production: MySQL via Docker ou serveur externe
        SQLALCHEMY_DATABASE_URI = os.environ.get(
            'DATABASE_URL', 
            'mysql+pymysql://resumesection_user:resumesection_password@localhost:3306/resumesection_db'
        )
    else:
        # Développement: SQLite local
        db_path = os.path.join(INSTANCE_DIR, 'dev.db')
        SQLALCHEMY_DATABASE_URI = os.environ.get(
            'DATABASE_URL', 
            f'sqlite:///{db_path}'
        )
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.environ.get('JWT_EXPIRES_HOURS', 8)))
    
    # CORS
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:5173').split(',')
    
    # Environment
    ENV = os.environ.get('FLASK_ENV', 'development')
    DEBUG = ENV == 'development'
    
    # Logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
