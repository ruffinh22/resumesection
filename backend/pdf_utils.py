"""
Utilitaires pour générer des PDF professionnels avec ReportLab
"""

import io
import datetime
import os
from reportlab.lib.pagesizes import letter, A4, landscape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


def format_currency(amount):
    """Formate un montant en devise XOF"""
    return f"{amount:,.0f} XOF".replace(',', ' ')


def get_logo_path():
    """Retourne le chemin vers le logo compact du dossier public"""
    # ReportLab ne supporte pas SVG, donc on cherche des formats supportés
    # TODO: Convertir SVG en PNG/JPG pour la production
    # Pour maintenant, on retourne None pour éviter les erreurs
    return None


def generate_reports_pdf(reports, title="Résumé des Rapports", filename="reports.pdf"):
    """Génère un PDF professionnel avec un tableau des rapports - Format paysage pour toutes les colonnes"""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=landscape(A4), topMargin=0.4*inch, bottomMargin=0.4*inch)
    
    elements = []
    styles = getSampleStyleSheet()
    
    # Header avec logo
    logo_path = get_logo_path()
    if logo_path:
        try:
            logo = Image(logo_path, width=0.7*inch, height=0.7*inch)
            header_data = [[
                logo,
                Paragraph(
                    f"<b style='font-size: 16px'>{title}</b><br/>" +
                    f"<font size='9' color='#6B7280'>Généré le {datetime.datetime.now().strftime('%d/%m/%Y à %H:%M')}</font>",
                    ParagraphStyle('Header', parent=styles['Normal'], fontSize=14, textColor=colors.HexColor('#1F2937'))
                )
            ]]
            header_table = Table(header_data, colWidths=[1.0*inch, 6.8*inch])
            header_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (0, 0), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('LEFTPADDING', (1, 0), (1, 0), 12),
            ]))
            elements.append(header_table)
        except Exception:
            # Si le logo ne peut pas être chargé, afficher juste le titre
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=18,
                textColor=colors.HexColor('#1F2937'),
                spaceAfter=12,
                alignment=1
            )
            elements.append(Paragraph(title, title_style))
            elements.append(Paragraph(f"Généré le {datetime.datetime.now().strftime('%d/%m/%Y à %H:%M')}", 
                                     ParagraphStyle('Subtitle', parent=styles['Normal'], fontSize=10, 
                                                   textColor=colors.HexColor('#6B7280'), alignment=1)))
    else:
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#1F2937'),
            spaceAfter=12,
            alignment=1
        )
        elements.append(Paragraph(title, title_style))
        elements.append(Paragraph(f"Généré le {datetime.datetime.now().strftime('%d/%m/%Y à %H:%M')}", 
                                 ParagraphStyle('Subtitle', parent=styles['Normal'], fontSize=10, 
                                               textColor=colors.HexColor('#6B7280'), alignment=1)))
    
    elements.append(Spacer(1, 0.3*inch))
    
    data = [
        [
            Paragraph("<b>Date</b>", styles['Normal']),
            Paragraph("<b>Section</b>", styles['Normal']),
            Paragraph("<b>Prédicateur</b>", styles['Normal']),
            Paragraph("<b>Total</b>", styles['Normal']),
            Paragraph("<b>Hommes</b>", styles['Normal']),
            Paragraph("<b>Femmes</b>", styles['Normal']),
            Paragraph("<b>Enfants</b>", styles['Normal']),
            Paragraph("<b>Jeunes</b>", styles['Normal']),
            Paragraph("<b>Offrande</b>", styles['Normal']),
            Paragraph("<b>Devise</b>", styles['Normal']),
            Paragraph("<b>Notes</b>", styles['Normal']),
        ]
    ]
    
    for i, report in enumerate(reports):
        date_str = report.date.strftime('%d/%m/%Y') if isinstance(report.date, datetime.date) else str(report.date)
        section_str = str(report.section_id) if hasattr(report, 'section_id') else '—'
        preacher = report.preacher if hasattr(report, 'preacher') else '—'
        total = str(report.total_attendees) if hasattr(report, 'total_attendees') else '—'
        men = str(report.men) if hasattr(report, 'men') else '—'
        women = str(report.women) if hasattr(report, 'women') else '—'
        children = str(report.children) if hasattr(report, 'children') else '—'
        youth = str(report.youth) if hasattr(report, 'youth') else '—'
        offering = format_currency(report.offering) if hasattr(report, 'offering') else '—'
        currency = report.currency if hasattr(report, 'currency') else 'XOF'
        notes = (report.notes[:30] + '...' if len(report.notes) > 30 else report.notes) if hasattr(report, 'notes') and report.notes else '—'
        
        bg_color = colors.HexColor('#F9FAFB') if i % 2 == 0 else colors.white
        text_color = colors.HexColor('#374151')
        
        data.append([
            Paragraph(date_str, ParagraphStyle('Normal', parent=styles['Normal'], textColor=text_color, fontSize=8)),
            Paragraph(section_str, ParagraphStyle('Normal', parent=styles['Normal'], textColor=text_color, fontSize=8)),
            Paragraph(preacher, ParagraphStyle('Normal', parent=styles['Normal'], textColor=text_color, fontSize=8)),
            Paragraph(total, ParagraphStyle('Normal', parent=styles['Normal'], textColor=colors.HexColor('#3B82F6'), fontName='Helvetica-Bold', fontSize=8, alignment=2)),
            Paragraph(men, ParagraphStyle('Normal', parent=styles['Normal'], textColor=colors.HexColor('#3B82F6'), fontSize=8, alignment=2)),
            Paragraph(women, ParagraphStyle('Normal', parent=styles['Normal'], textColor=colors.HexColor('#EC4899'), fontSize=8, alignment=2)),
            Paragraph(children, ParagraphStyle('Normal', parent=styles['Normal'], textColor=colors.HexColor('#10B981'), fontSize=8, alignment=2)),
            Paragraph(youth, ParagraphStyle('Normal', parent=styles['Normal'], textColor=colors.HexColor('#F59E0B'), fontSize=8, alignment=2)),
            Paragraph(offering, ParagraphStyle('Normal', parent=styles['Normal'], textColor=colors.HexColor('#059669'), fontName='Helvetica-Bold', fontSize=8, alignment=2)),
            Paragraph(currency, ParagraphStyle('Normal', parent=styles['Normal'], textColor=text_color, fontSize=8, alignment=1)),
            Paragraph(notes, ParagraphStyle('Normal', parent=styles['Normal'], textColor=text_color, fontSize=7)),
        ])
    table = Table(data, colWidths=[0.7*inch, 0.6*inch, 0.9*inch, 0.6*inch, 0.6*inch, 0.6*inch, 0.65*inch, 0.65*inch, 0.9*inch, 0.6*inch, 0.7*inch])
    
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3B82F6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('TOPPADDING', (0, 0), (-1, 0), 10),
        
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#D1D5DB')),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ('LEFTPADDING', (0, 1), (-1, -1), 8),
        ('RIGHTPADDING', (0, 1), (-1, -1), 8),
        
        ('ALIGN', (3, 1), (3, -1), 'RIGHT'),
        ('ALIGN', (4, 1), (4, -1), 'RIGHT'),
        
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F9FAFB')]),
        
        ('ROWHEIGHTS', (0, 0), (-1, -1), 0.35*inch),
    ]))
    
    elements.append(table)
    
    elements.append(Spacer(1, 0.3*inch))
    total_reports = len(reports)
    total_offering = sum(r.offering for r in reports if hasattr(r, 'offering'))
    total_attendees = sum(r.total_attendees for r in reports if hasattr(r, 'total_attendees'))
    
    summary_text = f"<b>Total:</b> {total_reports} rapports | Offrande: {format_currency(total_offering)} | Fidèles: {total_attendees}"
    elements.append(Paragraph(summary_text, ParagraphStyle(
        'Summary',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#374151'),
        backgroundColor=colors.HexColor('#F3F4F6'),
        spaceAfter=12
    )))
    
    doc.build(elements)
    buf.seek(0)
    
    return buf


def generate_single_report_pdf(report, filename="report.pdf"):
    """Génère un PDF professionnel pour un rapport unique avec toutes les colonnes"""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    elements = []
    styles = getSampleStyleSheet()
    
    # Header avec logo
    logo_path = get_logo_path()
    if logo_path:
        try:
            logo = Image(logo_path, width=0.9*inch, height=0.9*inch)
            header_data = [[
                logo,
                Paragraph(
                    "<b style='font-size: 14px'>Rapport de Service Détaillé</b><br/>" +
                    "<font size='8' color='#6B7280'>Église Évangélique - ResumeSection</font>",
                    ParagraphStyle('Header', parent=styles['Normal'], fontSize=12, textColor=colors.HexColor('#1F2937'))
                )
            ]]
            header_table = Table(header_data, colWidths=[1.2*inch, 4.3*inch])
            header_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (0, 0), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('LEFTPADDING', (1, 0), (1, 0), 12),
            ]))
            elements.append(header_table)
        except Exception:
            pass
    
    elements.append(Spacer(1, 0.25*inch))
    
    section_title_style = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.HexColor('#3B82F6'),
        spaceAfter=10,
        spaceBefore=10
    )
    
    # Date du service
    date_str = report.date.strftime('%d/%m/%Y') if isinstance(report.date, datetime.date) else str(report.date)
    elements.append(Paragraph(f"<b>Date du service :</b> {date_str}", 
                             ParagraphStyle('DateInfo', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#374151'))))
    elements.append(Spacer(1, 0.2*inch))
    
    # Tableau de données détaillé - TOUTES LES COLONNES
    elements.append(Paragraph("Détails du Service", section_title_style))
    
    detail_data = [
        ['Section', str(report.section_id)],
        ['Prédicateur', report.preacher if hasattr(report, 'preacher') else '—'],
        ['Total des Fidèles', str(report.total_attendees) if hasattr(report, 'total_attendees') else '—'],
        ['Hommes', str(report.men) if hasattr(report, 'men') else '—'],
        ['Femmes', str(report.women) if hasattr(report, 'women') else '—'],
        ['Enfants', str(report.children) if hasattr(report, 'children') else '—'],
        ['Jeunes', str(report.youth) if hasattr(report, 'youth') else '—'],
        ['Offrande', format_currency(report.offering) if hasattr(report, 'offering') else '—'],
        ['Devise', report.currency if hasattr(report, 'currency') else 'XOF'],
    ]
    
    detail_table = Table(detail_data, colWidths=[2.5*inch, 3.5*inch])
    detail_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#3B82F6')),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.white),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        
        ('BACKGROUND', (1, 0), (1, -1), colors.HexColor('#F3F4F6')),
        ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#1F2937')),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#E5E7EB')),
        ('ROWHEIGHTS', (0, 0), (-1, -1), 0.4*inch),
    ]))
    
    elements.append(detail_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Résumé démographique
    elements.append(Paragraph("Résumé Démographique", section_title_style))
    
    demo_data = [
        [
            Paragraph("<b>Hommes</b>", styles['Normal']),
            Paragraph("<b>Femmes</b>", styles['Normal']),
            Paragraph("<b>Enfants</b>", styles['Normal']),
            Paragraph("<b>Jeunes</b>", styles['Normal']),
            Paragraph("<b>Total</b>", styles['Normal']),
        ]
    ]
    
    men_val = str(report.men) if hasattr(report, 'men') else '0'
    women_val = str(report.women) if hasattr(report, 'women') else '0'
    children_val = str(report.children) if hasattr(report, 'children') else '0'
    youth_val = str(report.youth) if hasattr(report, 'youth') else '0'
    total_val = str(report.total_attendees) if hasattr(report, 'total_attendees') else '0'
    
    demo_data.append([
        Paragraph(men_val, ParagraphStyle('Normal', parent=styles['Normal'], textColor=colors.HexColor('#3B82F6'), fontName='Helvetica-Bold', fontSize=11, alignment=1)),
        Paragraph(women_val, ParagraphStyle('Normal', parent=styles['Normal'], textColor=colors.HexColor('#EC4899'), fontName='Helvetica-Bold', fontSize=11, alignment=1)),
        Paragraph(children_val, ParagraphStyle('Normal', parent=styles['Normal'], textColor=colors.HexColor('#10B981'), fontName='Helvetica-Bold', fontSize=11, alignment=1)),
        Paragraph(youth_val, ParagraphStyle('Normal', parent=styles['Normal'], textColor=colors.HexColor('#F59E0B'), fontName='Helvetica-Bold', fontSize=11, alignment=1)),
        Paragraph(total_val, ParagraphStyle('Normal', parent=styles['Normal'], textColor=colors.HexColor('#1F2937'), fontName='Helvetica-Bold', fontSize=12, alignment=1)),
    ])
    
    demo_table = Table(demo_data, colWidths=[1*inch, 1*inch, 1*inch, 1*inch, 1*inch])
    demo_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3B82F6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#D1D5DB')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#F9FAFB')]),
        ('ROWHEIGHTS', (0, 0), (-1, -1), 0.35*inch),
    ]))
    
    elements.append(demo_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Notes
    if hasattr(report, 'notes') and report.notes:
        elements.append(Paragraph("Notes", section_title_style))
        notes_style = ParagraphStyle(
            'Notes',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#4B5563'),
            spaceAfter=12
        )
        elements.append(Paragraph(report.notes, notes_style))
        elements.append(Spacer(1, 0.2*inch))
    
    # Footer
    elements.append(Spacer(1, 0.3*inch))
    footer_text = f"Généré le {datetime.datetime.now().strftime('%d/%m/%Y à %H:%M')}"
    elements.append(Paragraph(footer_text, ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor('#9CA3AF'),
        alignment=1
    )))
    
    doc.build(elements)
    buf.seek(0)
    
    return buf
