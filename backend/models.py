from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import datetime

db = SQLAlchemy()


class User(db.Model):
    """Modèle utilisateur avec authentification"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='section')  # 'admin' ou 'section'
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def set_password(self, raw_password: str) -> None:
        """Hache le mot de passe"""
        self.password = generate_password_hash(raw_password)

    def check_password(self, raw_password: str) -> bool:
        """Vérifie le mot de passe"""
        return check_password_hash(self.password, raw_password)

    def to_dict(self):
        """Convertit l'utilisateur en dictionnaire"""
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
        }

    def __repr__(self) -> str:
        return f"<User {self.username} ({self.role})>"


class Report(db.Model):
    """Modèle rapport de service"""
    id = db.Column(db.Integer, primary_key=True)
    section_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.Date, nullable=False, index=True)
    preacher = db.Column(db.String(120), nullable=False)
    total_attendees = db.Column(db.Integer, nullable=False)
    men = db.Column(db.Integer, default=0)
    women = db.Column(db.Integer, default=0)
    children = db.Column(db.Integer, default=0)
    youth = db.Column(db.Integer, default=0)
    offering = db.Column(db.Float, default=0.0)  # En francs CFA
    currency = db.Column(db.String(10), default='XOF')  # CFA = XOF
    notes = db.Column(db.Text, nullable=True)
    submitted_by = db.Column(db.String(120), nullable=True)
    submitted_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        """Convertit le rapport en dictionnaire"""
        return {
            'id': self.id,
            'section_id': self.section_id,
            'date': self.date.strftime('%Y-%m-%d') if self.date else None,
            'preacher': self.preacher,
            'total_attendees': self.total_attendees,
            'men': self.men or 0,
            'women': self.women or 0,
            'children': self.children or 0,
            'youth': self.youth or 0,
            'offering': float(self.offering) if self.offering is not None else 0.0,
            'currency': self.currency,
            'notes': self.notes,
            'submitted_by': self.submitted_by,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
        }

    def __repr__(self) -> str:
        return f"<Report {self.id} - {self.date} ({self.preacher})"


class WeeklyStats(db.Model):
    """Modèle pour les statistiques hebdomadaires (réinitialisées chaque lundi)"""
    id = db.Column(db.Integer, primary_key=True)
    section_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    week_start = db.Column(db.Date, nullable=False, index=True)  # Lundi de la semaine
    week_end = db.Column(db.Date, nullable=False)  # Dimanche de la semaine
    total_offering = db.Column(db.Float, default=0.0)  # En francs CFA
    currency = db.Column(db.String(10), default='XOF')
    total_attendees = db.Column(db.Integer, default=0)
    total_services = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Index composite pour éviter les doublons
    __table_args__ = (
        db.UniqueConstraint('section_id', 'week_start', name='unique_weekly_stats'),
    )

    def to_dict(self):
        """Convertit les stats hebdomadaires en dictionnaire"""
        return {
            'id': self.id,
            'section_id': self.section_id,
            'week_start': self.week_start.strftime('%Y-%m-%d'),
            'week_end': self.week_end.strftime('%Y-%m-%d'),
            'total_offering': float(self.total_offering),
            'currency': self.currency,
            'total_attendees': self.total_attendees,
            'total_services': self.total_services,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self) -> str:
        return f"<WeeklyStats {self.section_id} - Week of {self.week_start}>"
