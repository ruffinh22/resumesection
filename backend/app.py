from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
    verify_jwt_in_request,
    decode_token,
)
import logging
import datetime
import io

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from config import Config
from models import db, User, Report, WeeklyStats
from report_schema import ReportSchema
from pdf_utils import generate_reports_pdf, generate_single_report_pdf
from weekly_stats import (
    get_or_create_weekly_stats,
    update_weekly_stats_from_report,
    get_current_week_offering,
    get_monday_of_week,
    get_weekly_stats as get_all_weekly_stats,
)


def create_app(config_class=Config):
    """Factory pour créer l'application Flask"""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # CORS - permettre le frontend en développement
    CORS(app, 
         origins=app.config.get('CORS_ORIGINS', ['http://localhost:5173']),
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    )
    
    # Init database
    db.init_app(app)

    # JWT
    jwt = JWTManager(app)

    # Logging
    logging.basicConfig(
        level=app.config.get('LOG_LEVEL', 'INFO'),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logger = logging.getLogger(__name__)

    # ==================== JWT Error Handlers ====================
    @jwt.unauthorized_loader
    def unauthorized_callback(err_msg):
        logger.warning(f'Unauthorized access attempt: {err_msg}')
        return jsonify({'msg': 'Token manquant ou invalide', 'error': err_msg}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(err_msg):
        logger.warning(f'Invalid token: {err_msg}')
        return jsonify({'msg': 'Token invalide', 'error': err_msg}), 422

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        logger.info('Token expired')
        return jsonify({'msg': 'Token expiré'}), 401

    # ==================== Error Handlers ====================
    @app.errorhandler(422)
    def handle_unprocessable_entity(err):
        return jsonify({'msg': 'Erreur 422 : JSON mal formé', 'details': str(err)}), 422

    @app.errorhandler(400)
    def handle_bad_request(err):
        return jsonify({'msg': 'Requête invalide', 'error': str(err)}), 400

    @app.errorhandler(500)
    def handle_internal_error(err):
        logger.error(f'Internal server error: {err}')
        return jsonify({'msg': 'Erreur serveur interne'}), 500

    # ==================== Health Check ====================
    @app.route('/', methods=['GET'])
    def index():
        """Vérifie que le backend fonctionne"""
        return jsonify({'msg': 'ResumeSection backend running', 'version': '1.0.0'}), 200

    # ==================== Registration ====================
    @app.route('/register', methods=['POST', 'OPTIONS'])
    def register():
        """Enregistre un nouvel utilisateur"""
        if request.method == 'OPTIONS':
            return '', 204

        try:
            data = request.get_json(force=True)
        except Exception as e:
            logger.error(f'Invalid JSON in register: {e}')
            return jsonify({'msg': 'JSON invalide', 'error': str(e)}), 400

        username = data.get('username')
        password = data.get('password')
        role = data.get('role', 'section')

        # Validation
        if not username or not password:
            return jsonify({'msg': 'Nom d\'utilisateur et mot de passe requis'}), 400

        if not username.strip() or len(username) < 3:
            return jsonify({'msg': 'Nom d\'utilisateur invalide (min 3 caractères)'}), 400

        if len(password) < 6:
            return jsonify({'msg': 'Mot de passe trop court (min 6 caractères)'}), 400

        # Bootstrap: premier utilisateur sans authentification
        if User.query.count() > 0:
            try:
                verify_jwt_in_request()
                claims = get_jwt()
                if claims.get('role') != 'admin':
                    return jsonify({'msg': 'Seul un administrateur peut créer des utilisateurs'}), 403
            except Exception:
                return jsonify({'msg': 'Authentification requise pour créer un utilisateur'}), 403

        # Vérifier unicité
        if User.query.filter_by(username=username).first():
            return jsonify({'msg': 'Nom d\'utilisateur déjà utilisé'}), 400

        # Créer l'utilisateur
        user = User(username=username, role=role)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        logger.info(f'User created: {username} (role: {role})')
        return jsonify({'msg': 'Utilisateur créé', 'id': user.id}), 201

    # ==================== Login ====================
    @app.route('/login', methods=['POST', 'OPTIONS'])
    def login():
        """Authentifie un utilisateur"""
        if request.method == 'OPTIONS':
            return '', 204

        try:
            data = request.get_json(force=True)
        except Exception as e:
            logger.error(f'Invalid JSON in login: {e}')
            return jsonify({'msg': 'JSON invalide'}), 400

        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'msg': 'Nom d\'utilisateur et mot de passe requis'}), 400

        user = User.query.filter_by(username=username).first()
        if not user or not user.check_password(password):
            logger.warning(f'Failed login attempt for: {username}')
            return jsonify({'msg': 'Identifiants invalides'}), 401

        # Créer le token JWT
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={'role': user.role, 'username': user.username}
        )

        logger.info(f'User logged in: {username}')
        return jsonify({
            'access_token': access_token,
            'role': user.role,
            'username': user.username,
            'id': user.id
        }), 200

    # ==================== Create Report ====================
    @app.route('/report', methods=['POST', 'OPTIONS'])
    @jwt_required()
    def add_report():
        """Crée un nouveau rapport"""
        if request.method == 'OPTIONS':
            return '', 204

        try:
            payload = request.get_json(force=True)
        except Exception as e:
            logger.error(f'Invalid JSON in add_report: {e}')
            return jsonify({'msg': 'JSON invalide', 'error': str(e)}), 400

        # Mapping flexible des clés
        mapping = {
            'totalFaithful': 'total_attendees',
            'total_faithful': 'total_attendees',
            'totalFaithfulCount': 'total_attendees',
            'total': 'total_attendees',
            'menCount': 'men',
            'men_count': 'men',
            'womenCount': 'women',
            'women_count': 'women',
            'childrenCount': 'children',
            'children_count': 'children',
            'kids': 'children',
            'youthCount': 'youth',
            'youth_count': 'youth',
            'offrande': 'offering',
            'offre': 'offering',
            'don': 'offering',
            'notes': 'notes',
            'note': 'notes',
            'preacher': 'preacher',
            'predicateur': 'preacher',
            'date': 'date',
            'report_date': 'date',
        }

        # Coercer les valeurs numériques
        def coerce_numeric(key, value):
            if value is None:
                return None
            if isinstance(value, (int, float)):
                return value
            try:
                s = str(value).strip()
                if s == '':
                    return None
                if s.isdigit() or (s.startswith('-') and s[1:].isdigit()):
                    return int(s)
                s2 = s.replace(',', '.')
                return float(s2)
            except Exception:
                return value

        # Normaliser les clés
        normalized = {}
        if isinstance(payload, dict):
            for k, v in payload.items():
                mapped = mapping.get(k, k)
                if mapped in ('total_attendees', 'men', 'women', 'children', 'youth', 'offering'):
                    v = coerce_numeric(mapped, v)
                normalized[mapped] = v

        # Valider
        schema = ReportSchema()
        errors = schema.validate(normalized)
        if errors:
            logger.warning(f'Validation errors: {errors}')
            return jsonify({'msg': 'Erreur de validation', 'errors': errors}), 422

        data = schema.load(normalized)

        # Récupérer l'ID de l'utilisateur
        identity = get_jwt_identity()
        try:
            section_id = int(identity)
        except Exception:
            return jsonify({'msg': 'Identity token invalide'}), 400

        # Créer le rapport
        report = Report(
            date=data['date'],
            preacher=data['preacher'],
            total_attendees=data['total_attendees'],
            men=data.get('men', 0) or 0,
            women=data.get('women', 0) or 0,
            children=data.get('children', 0) or 0,
            youth=data.get('youth', 0) or 0,
            offering=data.get('offering', 0.0) or 0.0,
            currency='XOF',  # Francs CFA
            section_id=section_id,
            notes=data.get('notes'),
            submitted_by=User.query.get(section_id).username if User.query.get(section_id) else None,
            submitted_at=datetime.datetime.utcnow(),
        )

        db.session.add(report)
        db.session.commit()

        # Mettre à jour les stats hebdomadaires
        try:
            weekly_stats = update_weekly_stats_from_report(report)
            logger.info(f'Weekly stats updated: {weekly_stats.id}')
        except Exception as e:
            logger.error(f'Error updating weekly stats: {e}')
            # Continuer même si les stats ne s'mettent pas à jour

        logger.info(f'Report created: ID {report.id} by user {section_id}')
        return jsonify({'msg': 'Rapport créé', 'id': report.id}), 201

    # ==================== Get My Reports ====================
    @app.route('/my-reports', methods=['GET', 'OPTIONS'])
    @jwt_required()
    def get_my_reports():
        """Récupère les rapports de l'utilisateur connecté (section uniquement)"""
        if request.method == 'OPTIONS':
            return '', 204

        claims = get_jwt()
        role = claims.get('role')
        
        # Récupérer l'ID de l'utilisateur
        identity = get_jwt_identity()
        try:
            section_id = int(identity)
        except Exception:
            return jsonify({'msg': 'Identity token invalide'}), 400

        # Filtrer par section_id
        query = Report.query.filter_by(section_id=section_id)
        
        # Filtres optionnels par date
        start = request.args.get('start')
        end = request.args.get('end')
        
        try:
            if start:
                start_date = datetime.datetime.strptime(start, '%Y-%m-%d').date()
                query = query.filter(Report.date >= start_date)
            if end:
                end_date = datetime.datetime.strptime(end, '%Y-%m-%d').date()
                query = query.filter(Report.date <= end_date)
        except ValueError:
            return jsonify({'msg': 'Format de date invalide, utilisez YYYY-MM-DD'}), 400

        reports = query.order_by(Report.date.desc()).all()
        
        logger.info(f'Retrieved {len(reports)} reports for section {section_id}')
        return jsonify([r.to_dict() for r in reports]), 200

    # ==================== Delete Report ====================
    @app.route('/report/<int:report_id>', methods=['DELETE', 'OPTIONS'])
    @jwt_required()
    def delete_report(report_id):
        """Supprime un rapport (propriétaire ou admin seulement)"""
        if request.method == 'OPTIONS':
            return '', 204

        report = Report.query.get(report_id)
        if not report:
            return jsonify({'msg': 'Rapport non trouvé'}), 404

        identity = get_jwt_identity()
        claims = get_jwt()
        role = claims.get('role')
        
        try:
            user_id = int(identity)
        except Exception:
            return jsonify({'msg': 'Identity token invalide'}), 400

        # Vérifier que c'est le propriétaire ou un admin
        if role != 'admin' and report.section_id != user_id:
            return jsonify({'msg': 'Vous ne pouvez supprimer que vos propres rapports'}), 403

        section_id = report.section_id
        db.session.delete(report)
        db.session.commit()

        # Recalculer les stats hebdomadaires
        try:
            weekly_stats = get_or_create_weekly_stats(section_id, report.date)
            reports_in_week = Report.query.filter(
                Report.section_id == section_id,
                Report.date >= weekly_stats.week_start,
                Report.date <= weekly_stats.week_end
            ).all()
            weekly_stats.total_offering = sum(r.offering or 0.0 for r in reports_in_week)
            weekly_stats.total_attendees = sum(r.total_attendees or 0 for r in reports_in_week)
            weekly_stats.total_services = len(reports_in_week)
            db.session.commit()
        except Exception as e:
            logger.error(f'Error updating weekly stats: {e}')

        logger.info(f'Report {report_id} deleted')
        return jsonify({'msg': f'Rapport {report_id} supprimé'}), 200

    # ==================== Download Individual Report PDF ====================
    @app.route('/report/<int:report_id>/pdf', methods=['GET', 'OPTIONS'])
    @jwt_required()
    def download_report_pdf(report_id):
        """Télécharge le PDF d'un rapport spécifique"""
        if request.method == 'OPTIONS':
            return '', 204

        report = Report.query.get(report_id)
        if not report:
            return jsonify({'msg': 'Rapport non trouvé'}), 404

        identity = get_jwt_identity()
        claims = get_jwt()
        role = claims.get('role')
        
        try:
            user_id = int(identity)
        except Exception:
            return jsonify({'msg': 'Identity token invalide'}), 400

        # Vérifier que c'est le propriétaire ou un admin
        if role != 'admin' and report.section_id != user_id:
            return jsonify({'msg': 'Vous ne pouvez télécharger que vos propres rapports'}), 403

        try:
            pdf_buffer = generate_single_report_pdf(report)
            return send_file(
                pdf_buffer,
                mimetype='application/pdf',
                as_attachment=True,
                download_name=f'rapport-{report.id}.pdf'
            )
        except Exception as e:
            logger.error(f'Error generating PDF: {e}')
            return jsonify({'msg': 'Erreur lors de la génération du PDF'}), 500

    # ==================== Get Summary ====================
    @app.route('/summary', methods=['GET', 'OPTIONS'])
    @jwt_required()
    def summary():
        """Récupère le résumé des rapports (admin uniquement)"""
        if request.method == 'OPTIONS':
            return '', 204

        try:
            claims = get_jwt()
            role = claims.get('role')
            user_id = get_jwt_identity()
            logger.info(f'Summary request from user {user_id} with role {role}')
            
            if role != 'admin':
                logger.warning(f'Non-admin user {user_id} tried to access summary')
                return jsonify({'msg': 'Seul l\'administrateur peut accéder aux résumés'}), 403

            start = request.args.get('start')
            end = request.args.get('end')

            query = Report.query
            try:
                if start:
                    start_date = datetime.datetime.strptime(start, '%Y-%m-%d').date()
                    query = query.filter(Report.date >= start_date)
                if end:
                    end_date = datetime.datetime.strptime(end, '%Y-%m-%d').date()
                    query = query.filter(Report.date <= end_date)
            except ValueError:
                return jsonify({'msg': 'Format de date invalide, utilisez YYYY-MM-DD'}), 400

            reports = query.order_by(Report.date.desc()).all()
            logger.info(f'Returning {len(reports)} reports')
            
            return jsonify([r.to_dict() for r in reports]), 200
        except Exception as e:
            logger.error(f'Error in summary endpoint: {str(e)}', exc_info=True)
            return jsonify({'msg': 'Erreur serveur', 'error': str(e)}), 500

    # ==================== Export PDF ====================
    @app.route('/summary/pdf', methods=['GET', 'OPTIONS'])
    def summary_pdf():
        """Exporte les rapports en PDF avec tableau professionnel"""
        if request.method == 'OPTIONS':
            return '', 204

        # Récupérer le token (header ou query param)
        auth = request.headers.get('Authorization', None)
        claims = None
        try:
            if auth and auth.startswith('Bearer '):
                verify_jwt_in_request()
                claims = get_jwt()
            else:
                token = request.args.get('token')
                if not token:
                    return jsonify({'msg': 'Token manquant'}), 401
                claims = decode_token(token)
        except Exception as e:
            logger.error(f'Token validation error in PDF export: {e}')
            return jsonify({'msg': 'Token invalide'}), 401

        role = claims.get('role')
        if role != 'admin':
            return jsonify({'msg': 'Seul l\'administrateur peut exporter en PDF'}), 403

        # Récupérer les dates
        start = request.args.get('start')
        end = request.args.get('end')

        query = Report.query
        try:
            if start:
                start_date = datetime.datetime.strptime(start, '%Y-%m-%d').date()
                query = query.filter(Report.date >= start_date)
            if end:
                end_date = datetime.datetime.strptime(end, '%Y-%m-%d').date()
                query = query.filter(Report.date <= end_date)
        except ValueError:
            return jsonify({'msg': 'Format de date invalide'}), 400

        reports = query.order_by(Report.date.desc()).all()

        # Générer le PDF professionnel
        try:
            buf = generate_reports_pdf(reports, title="Résumé des Rapports - Tous les Rapports")
            logger.info(f'PDF export requested for {len(reports)} reports')
            return send_file(buf, mimetype='application/pdf', as_attachment=True, download_name='rapports_resume.pdf')
        except Exception as e:
            logger.error(f'Error generating PDF: {e}')
            return jsonify({'msg': 'Erreur lors de la génération du PDF'}), 500

    # ==================== Section Report PDF ====================
    @app.route('/section-report/pdf', methods=['GET', 'OPTIONS'])
    def section_report_pdf():
        """Exporte les rapports d'une section spécifique en PDF professionnel"""
        if request.method == 'OPTIONS':
            return '', 204

        # Récupérer et valider le token
        auth = request.headers.get('Authorization', None)
        claims = None
        try:
            if auth and auth.startswith('Bearer '):
                verify_jwt_in_request()
                claims = get_jwt()
            else:
                token = request.args.get('token')
                if not token:
                    return jsonify({'msg': 'Token manquant'}), 401
                claims = decode_token(token)
        except Exception as e:
            logger.error(f'Token validation error: {e}')
            return jsonify({'msg': 'Token invalide'}), 401

        # Vérifier admin
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'Seul l\'administrateur peut exporter'}), 403

        # Récupérer section_id
        section_id = request.args.get('section_id')
        if not section_id:
            return jsonify({'msg': 'section_id requis'}), 400

        try:
            section_id = int(section_id)
        except ValueError:
            return jsonify({'msg': 'section_id invalide'}), 400

        # Récupérer les rapports
        reports = Report.query.filter_by(section_id=section_id).order_by(Report.date.desc()).all()

        try:
            buf = generate_reports_pdf(reports, title=f"Rapports de la Section {section_id}")
            logger.info(f'Section {section_id} PDF export requested for {len(reports)} reports')
            return send_file(buf, mimetype='application/pdf', as_attachment=True, download_name=f'rapports_section_{section_id}.pdf')
        except Exception as e:
            logger.error(f'Error generating PDF for section: {e}')
            return jsonify({'msg': 'Erreur lors de la génération du PDF'}), 500

    # ==================== Individual Report PDF ====================
    @app.route('/report/pdf', methods=['GET', 'OPTIONS'])
    def report_pdf():
        """Exporte un rapport spécifique en PDF professionnel"""
        if request.method == 'OPTIONS':
            return '', 204

        # Récupérer et valider le token
        auth = request.headers.get('Authorization', None)
        claims = None
        try:
            if auth and auth.startswith('Bearer '):
                verify_jwt_in_request()
                claims = get_jwt()
            else:
                token = request.args.get('token')
                if not token:
                    return jsonify({'msg': 'Token manquant'}), 401
                claims = decode_token(token)
        except Exception as e:
            logger.error(f'Token validation error: {e}')
            return jsonify({'msg': 'Token invalide'}), 401

        # Récupérer report_id
        report_id = request.args.get('report_id')
        if not report_id:
            return jsonify({'msg': 'report_id requis'}), 400

        try:
            report_id = int(report_id)
        except ValueError:
            return jsonify({'msg': 'report_id invalide'}), 400

        # Récupérer le rapport
        report = Report.query.get(report_id)
        if not report:
            return jsonify({'msg': 'Rapport non trouvé'}), 404

        try:
            buf = generate_single_report_pdf(report)
            logger.info(f'Individual report {report_id} PDF export requested')
            return send_file(buf, mimetype='application/pdf', as_attachment=True, download_name=f'rapport_{report_id}.pdf')
        except Exception as e:
            logger.error(f'Error generating PDF for report: {e}')
            return jsonify({'msg': 'Erreur lors de la génération du PDF'}), 500

        p.save()
        buf.seek(0)

        logger.info(f'Report {report_id} PDF export requested')
        return send_file(buf, mimetype='application/pdf', as_attachment=True, download_name=f'rapport_{report_id}.pdf')

    # ==================== Weekly Stats Endpoints ====================
    @app.route('/weekly-stats', methods=['GET', 'OPTIONS'])
    @jwt_required()
    def get_weekly_stats():
        """Récupère les stats hebdomadaires de la semaine courante"""
        if request.method == 'OPTIONS':
            return '', 204

        identity = get_jwt_identity()
        try:
            section_id = int(identity)
        except Exception:
            return jsonify({'msg': 'Identity token invalide'}), 400

        # Récupérer la date optionnelle
        date_str = request.args.get('date')
        if date_str:
            try:
                date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'msg': 'Format de date invalide'}), 400
        else:
            date = datetime.date.today()

        try:
            stats = get_or_create_weekly_stats(section_id, date)
            logger.info(f'Weekly stats retrieved for section {section_id}')
            return jsonify(stats.to_dict()), 200
        except Exception as e:
            logger.error(f'Error retrieving weekly stats: {e}')
            return jsonify({'msg': 'Erreur lors de la récupération des stats'}), 500

    # ==================== Admin Weekly Stats ====================
    @app.route('/admin/weekly-stats', methods=['GET', 'OPTIONS'])
    @jwt_required()
    def get_all_weekly_stats_admin():
        """Récupère toutes les stats hebdomadaires (admin uniquement)"""
        if request.method == 'OPTIONS':
            return '', 204

        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'Seul l\'administrateur peut accéder'}), 403

        date_str = request.args.get('date')
        if date_str:
            try:
                date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'msg': 'Format de date invalide'}), 400
        else:
            date = datetime.date.today()

        try:
            stats_list = get_all_weekly_stats(section_id=None, date=date)
            logger.info(f'All weekly stats retrieved for admin')
            return jsonify([s.to_dict() for s in stats_list]), 200
        except Exception as e:
            logger.error(f'Error retrieving all weekly stats: {e}')
            return jsonify({'msg': 'Erreur lors de la récupération'}), 500

    # ==================== Current Week Offering ====================
    @app.route('/current-offering', methods=['GET', 'OPTIONS'])
    @jwt_required()
    def get_current_offering():
        """Récupère l'offrande totale pour la semaine courante"""
        if request.method == 'OPTIONS':
            return '', 204

        identity = get_jwt_identity()
        try:
            section_id = int(identity)
        except Exception:
            return jsonify({'msg': 'Identity token invalide'}), 400

        try:
            total_offering = get_current_week_offering(section_id)
            week_start = get_monday_of_week(datetime.date.today())
            
            return jsonify({
                'section_id': section_id,
                'week_start': week_start.strftime('%Y-%m-%d'),
                'total_offering': float(total_offering),
                'currency': 'XOF',  # Francs CFA
                'msg': 'Offrande de la semaine'
            }), 200
        except Exception as e:
            logger.error(f'Error calculating offering: {e}')
            return jsonify({'msg': 'Erreur lors du calcul'}), 500

    # ==================== Users Management (CRUD) ====================
    @app.route('/users', methods=['GET', 'OPTIONS'])
    @jwt_required()
    def get_users():
        """Récupère la liste de tous les utilisateurs (admin seulement)"""
        if request.method == 'OPTIONS':
            return '', 204
        
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'Accès réservé aux administrateurs'}), 403
        
        users = User.query.all()
        return jsonify([{
            'id': u.id,
            'username': u.username,
            'role': u.role,
            'created_at': u.created_at.isoformat() if u.created_at else None
        } for u in users]), 200

    @app.route('/users/<int:user_id>', methods=['GET', 'OPTIONS'])
    @jwt_required()
    def get_user(user_id):
        """Récupère les détails d'un utilisateur spécifique"""
        if request.method == 'OPTIONS':
            return '', 204
        
        claims = get_jwt()
        if claims.get('role') != 'admin' and int(get_jwt_identity()) != user_id:
            return jsonify({'msg': 'Accès réservé aux administrateurs ou au profil personnel'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'msg': 'Utilisateur non trouvé'}), 404
        
        return jsonify({
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'created_at': user.created_at.isoformat() if user.created_at else None
        }), 200

    @app.route('/users', methods=['POST'])
    @jwt_required()
    def create_user():
        """Crée un nouvel utilisateur (admin seulement)"""
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'Seul un administrateur peut créer des utilisateurs'}), 403
        
        try:
            data = request.get_json(force=True)
        except Exception as e:
            return jsonify({'msg': 'JSON invalide', 'error': str(e)}), 400
        
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        role = data.get('role', 'section')
        
        if not username or not password:
            return jsonify({'msg': 'Nom d\'utilisateur et mot de passe requis'}), 400
        
        if len(username) < 3:
            return jsonify({'msg': 'Nom d\'utilisateur invalide (min 3 caractères)'}), 400
        
        if len(password) < 6:
            return jsonify({'msg': 'Mot de passe trop court (min 6 caractères)'}), 400
        
        if role not in ('admin', 'section', 'viewer'):
            return jsonify({'msg': 'Rôle invalide (admin, section, viewer)'}), 400
        
        if User.query.filter_by(username=username).first():
            return jsonify({'msg': 'Nom d\'utilisateur déjà utilisé'}), 400
        
        user = User(username=username, role=role)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        logger.info(f'User created by admin: {username} (role: {role})')
        return jsonify({
            'msg': 'Utilisateur créé',
            'id': user.id,
            'username': user.username,
            'role': user.role
        }), 201

    @app.route('/users/<int:user_id>', methods=['PUT'])
    @jwt_required()
    def update_user(user_id):
        """Met à jour un utilisateur (admin seulement)"""
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'Seul un administrateur peut modifier les utilisateurs'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'msg': 'Utilisateur non trouvé'}), 404
        
        try:
            data = request.get_json(force=True)
        except Exception as e:
            return jsonify({'msg': 'JSON invalide', 'error': str(e)}), 400
        
        if 'username' in data:
            new_username = data['username'].strip()
            if not new_username:
                return jsonify({'msg': 'Nom d\'utilisateur vide'}), 400
            if len(new_username) < 3:
                return jsonify({'msg': 'Nom d\'utilisateur invalide (min 3 caractères)'}), 400
            if new_username != user.username and User.query.filter_by(username=new_username).first():
                return jsonify({'msg': 'Nom d\'utilisateur déjà utilisé'}), 400
            user.username = new_username
        
        if 'password' in data:
            password = data['password'].strip()
            if len(password) < 6:
                return jsonify({'msg': 'Mot de passe trop court (min 6 caractères)'}), 400
            user.set_password(password)
        
        if 'role' in data:
            role = data['role']
            if role not in ('admin', 'section', 'viewer'):
                return jsonify({'msg': 'Rôle invalide (admin, section, viewer)'}), 400
            user.role = role
        
        db.session.commit()
        logger.info(f'User updated: {user.username}')
        return jsonify({
            'msg': 'Utilisateur mis à jour',
            'id': user.id,
            'username': user.username,
            'role': user.role
        }), 200

    @app.route('/users/<int:user_id>', methods=['DELETE'])
    @jwt_required()
    def delete_user(user_id):
        """Supprime un utilisateur (admin seulement)"""
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'Seul un administrateur peut supprimer les utilisateurs'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'msg': 'Utilisateur non trouvé'}), 404
        
        username = user.username
        db.session.delete(user)
        db.session.commit()
        
        logger.info(f'User deleted: {username}')
        return jsonify({'msg': f'Utilisateur {username} supprimé'}), 200

    # ==================== Create Tables ====================
    with app.app_context():
        db.create_all()

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)