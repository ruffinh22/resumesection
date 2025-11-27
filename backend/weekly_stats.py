"""
Utilitaires pour gérer les statistiques hebdomadaires
"""
import datetime
from models import db, WeeklyStats, Report


def get_monday_of_week(date: datetime.date) -> datetime.date:
    """Retourne le lundi de la semaine pour une date donnée"""
    return date - datetime.timedelta(days=date.weekday())


def get_sunday_of_week(date: datetime.date) -> datetime.date:
    """Retourne le dimanche de la semaine pour une date donnée"""
    return get_monday_of_week(date) + datetime.timedelta(days=6)


def get_or_create_weekly_stats(section_id: int, date: datetime.date) -> WeeklyStats:
    """Récupère ou crée les stats hebdomadaires pour une section et une date"""
    week_start = get_monday_of_week(date)
    week_end = get_sunday_of_week(date)
    
    stats = WeeklyStats.query.filter(
        WeeklyStats.section_id == section_id,
        WeeklyStats.week_start == week_start
    ).first()
    
    if not stats:
        stats = WeeklyStats(
            section_id=section_id,
            week_start=week_start,
            week_end=week_end,
            total_offering=0.0,
            currency='XOF',
            total_attendees=0,
            total_services=0
        )
        db.session.add(stats)
        db.session.commit()
    
    return stats


def update_weekly_stats_from_report(report: Report) -> WeeklyStats:
    """Met à jour les stats hebdomadaires quand un rapport est ajouté/modifié"""
    stats = get_or_create_weekly_stats(report.section_id, report.date)
    
    # Recalculer toutes les stats pour cette semaine
    reports_in_week = Report.query.filter(
        Report.section_id == report.section_id,
        Report.date >= stats.week_start,
        Report.date <= stats.week_end
    ).all()
    
    stats.total_offering = sum(r.offering or 0.0 for r in reports_in_week)
    stats.total_attendees = sum(r.total_attendees or 0 for r in reports_in_week)
    stats.total_services = len(reports_in_week)
    stats.updated_at = datetime.datetime.utcnow()
    
    db.session.commit()
    return stats


def get_weekly_stats(section_id: int = None, date: datetime.date = None) -> list:
    """
    Récupère les stats hebdomadaires
    
    Args:
        section_id: ID de la section (None = toutes)
        date: Date de référence (None = semaine courante)
    
    Returns:
        Liste des WeeklyStats
    """
    if date is None:
        date = datetime.date.today()
    
    week_start = get_monday_of_week(date)
    
    query = WeeklyStats.query.filter(WeeklyStats.week_start == week_start)
    
    if section_id:
        query = query.filter(WeeklyStats.section_id == section_id)
    
    return query.all()


def get_current_week_offering(section_id: int) -> float:
    """Retourne l'offrande totale pour la semaine courante d'une section"""
    today = datetime.date.today()
    stats = get_or_create_weekly_stats(section_id, today)
    return float(stats.total_offering)


def reset_and_archive_week_stats() -> list:
    """
    Archivé et réinitialise les stats du lundi
    Cette fonction devrait être appelée par une tâche programmée
    """
    today = datetime.date.today()
    
    # Si ce n'est pas lundi, retourner une liste vide
    if today.weekday() != 0:  # 0 = lundi
        return []
    
    # Récupérer toutes les stats de la semaine passée
    past_monday = today - datetime.timedelta(days=7)
    past_stats = WeeklyStats.query.filter(
        WeeklyStats.week_start == past_monday
    ).all()
    
    # Note: Dans un système réel, on archiverait ces données
    # Pour maintenant, on les garde simplement en base
    
    # Créer les nouvelles stats pour la semaine courante (optionnel)
    # Elles seront créées à la demande lors du premier rapport
    
    return past_stats
