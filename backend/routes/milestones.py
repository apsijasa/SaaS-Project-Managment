# backend/routes/milestones.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Milestone, Project, Participant
from datetime import datetime

milestones_bp = Blueprint('milestones', __name__)

@milestones_bp.route('/<int:project_id>/milestones', methods=['POST'])
@jwt_required()
def create_milestone(project_id):
    """
    Crea un nuevo hito en un proyecto
    ---
    Ejemplo de cuerpo de solicitud:
    {
        "name": "Nombre del hito",
        "date": "2023-06-15",
        "responsible_id": 1  // ID del participante responsable (opcional)
    }
    """
    data = request.get_json()
    user_id = get_jwt_identity()
    
    # Validar datos
    if not data or not all(key in data for key in ['name', 'date']):
        return jsonify({'error': 'Datos incompletos'}), 400
    
    # Verificar si el proyecto existe y pertenece al usuario actual
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    if not project:
        return jsonify({'error': 'Proyecto no encontrado'}), 404
    
    try:
        # Convertir fecha
        milestone_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        
        # Validar que esté dentro del rango del proyecto
        if milestone_date < project.start_date or milestone_date > project.end_date:
            return jsonify({'error': 'La fecha del hito debe estar dentro del rango del proyecto'}), 400
        
        # Validar el participante responsable si se proporciona
        responsible_id = data.get('responsible_id')
        if responsible_id:
            responsible = Participant.query.filter_by(id=responsible_id, project_id=project_id).first()
            if not responsible:
                return jsonify({'error': 'Participante responsable no encontrado en este proyecto'}), 400
        
        # Crear nuevo hito
        milestone = Milestone(
            project_id=project_id,
            name=data['name'],
            date=milestone_date,
            responsible_id=responsible_id
        )
        
        db.session.add(milestone)
        db.session.commit()
        
        return jsonify({
            'message': 'Hito creado exitosamente',
            'milestone': milestone.to_dict()
        }), 201
        
    except ValueError:
        return jsonify({'error': 'Formato de fecha inválido. Utilice YYYY-MM-DD'}), 400

@milestones_bp.route('/<int:project_id>/milestones', methods=['GET'])
@jwt_required()
def get_milestones(project_id):
    """
    Obtiene todos los hitos de un proyecto
    """
    user_id = get_jwt_identity()
    
    # Verificar si el proyecto existe y pertenece al usuario actual
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    if not project:
        return jsonify({'error': 'Proyecto no encontrado'}), 404
    
    milestones = Milestone.query.filter_by(project_id=project_id).all()
    
    return jsonify({
        'milestones': [milestone.to_dict() for milestone in milestones]
    }), 200

@milestones_bp.route('/milestones/<int:milestone_id>', methods=['GET'])
@jwt_required()
def get_milestone(milestone_id):
    """
    Obtiene un hito específico
    """
    user_id = get_jwt_identity()
    
    # Obtener hito
    milestone = Milestone.query.get(milestone_id)
    
    if not milestone:
        return jsonify({'error': 'Hito no encontrado'}), 404
    
    # Verificar permisos
    project = Project.query.filter_by(id=milestone.project_id, user_id=user_id).first()
    if not project:
        return jsonify({'error': 'No tienes permiso para ver este hito'}), 403
    
    return jsonify({
        'milestone': milestone.to_dict()
    }), 200

@milestones_bp.route('/milestones/<int:milestone_id>', methods=['PUT'])
@jwt_required()
def update_milestone(milestone_id):
    """
    Actualiza un hito existente
    """
    data = request.get_json()
    user_id = get_jwt_identity()
    
    # Obtener hito
    milestone = Milestone.query.get(milestone_id)
    
    if not milestone:
        return jsonify({'error': 'Hito no encontrado'}), 404
    
    # Verificar permisos
    project = Project.query.filter_by(id=milestone.project_id, user_id=user_id).first()
    if not project:
        return jsonify({'error': 'No tienes permiso para modificar este hito'}), 403
    
    # Actualizar campos si están presentes
    if 'name' in data:
        milestone.name = data['name']
    
    # Actualizar fecha si se proporciona
    try:
        if 'date' in data:
            milestone_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            
            # Validar que esté dentro del rango del proyecto
            if milestone_date < project.start_date or milestone_date > project.end_date:
                return jsonify({'error': 'La fecha del hito debe estar dentro del rango del proyecto'}), 400
            
            milestone.date = milestone_date
    except ValueError:
        return jsonify({'error': 'Formato de fecha inválido. Utilice YYYY-MM-DD'}), 400
    
    # Actualizar participante responsable si se proporciona
    if 'responsible_id' in data:
        responsible_id = data['responsible_id']
        if responsible_id:
            responsible = Participant.query.filter_by(id=responsible_id, project_id=milestone.project_id).first()
            if not responsible:
                return jsonify({'error': 'Participante responsable no encontrado en este proyecto'}), 400
        milestone.responsible_id = responsible_id
    
    db.session.commit()
    
    return jsonify({
        'message': 'Hito actualizado exitosamente',
        'milestone': milestone.to_dict()
    }), 200

@milestones_bp.route('/milestones/<int:milestone_id>', methods=['DELETE'])
@jwt_required()
def delete_milestone(milestone_id):
    """
    Elimina un hito
    """
    user_id = get_jwt_identity()
    
    # Obtener hito
    milestone = Milestone.query.get(milestone_id)
    
    if not milestone:
        return jsonify({'error': 'Hito no encontrado'}), 404
    
    # Verificar permisos
    project = Project.query.filter_by(id=milestone.project_id, user_id=user_id).first()
    if not project:
        return jsonify({'error': 'No tienes permiso para eliminar este hito'}), 403
    
    db.session.delete(milestone)
    db.session.commit()
    
    return jsonify({
        'message': 'Hito eliminado exitosamente'
    }), 200