from marshmallow import Schema, fields, validate, pre_load

class ReportSchema(Schema):
    """Schéma de validation pour les rapports"""
    
    date = fields.Date(
        required=True, 
        format='%Y-%m-%d',
        error_messages={'invalid': 'Date invalide, format: YYYY-MM-DD'}
    )
    preacher = fields.Str(
        required=True, 
        validate=validate.Length(min=1, max=120),
        error_messages={'required': 'Prédicateur requis'}
    )
    total_attendees = fields.Int(
        required=True, 
        validate=validate.Range(min=0),
        error_messages={'required': 'Nombre total de fidèles requis'}
    )
    men = fields.Int(required=False, validate=validate.Range(min=0), allow_none=True)
    women = fields.Int(required=False, validate=validate.Range(min=0), allow_none=True)
    children = fields.Int(required=False, validate=validate.Range(min=0), allow_none=True)
    youth = fields.Int(required=False, validate=validate.Range(min=0), allow_none=True)
    offering = fields.Float(required=False, validate=validate.Range(min=0), allow_none=True)
    notes = fields.Str(required=False, allow_none=True)
    
    @pre_load
    def process_input(self, data, **kwargs):
        """Nettoie et normalise les données entrantes"""
        # Convertir les None en 0 pour les champs numériques
        numeric_fields = ['men', 'women', 'children', 'youth']
        for field in numeric_fields:
            if field in data and data[field] is None:
                data[field] = 0
        
        if 'offering' in data and data['offering'] is None:
            data['offering'] = 0.0
            
        return data
