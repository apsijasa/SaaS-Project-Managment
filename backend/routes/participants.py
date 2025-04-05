from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Participant, Project, User
from utils import project_access_required, project_admin_required

participants_bp = Blueprint('participants', __name__)

@participants_bp.route('/<int:project_id>/participants', methods=['POST'])
@jwt_required()
@project_admin_required
def create_participant(project_id):
    """
    Agrega un participante a un proyecto
    ---
    Ejemplo de cuerpo de solicitud:
    {
        "name": "Nombre Participante",
        "email": "participante@ejemplo.com",
        "role": "administrator"  // administrator, collaborator, external
    }
    """
    data = request.get_json()
    user_id = get_jwt_identity()
    
    # Validar datos
    if not data or not all(key in data for key in ['name', 'role']):
        return jsonify({'error': 'Datos incompletos'}), 400
    
    # Verificar si el proyecto existe
    project = Project.query.get(project_id)
    if not project:
        return jsonify({'error': 'Proyecto no encontrado'}), 404
    
    # Validar rol
    valid_roles = ['administrator', 'collaborator', 'external']
    if data['role'] not in valid_roles:
        return jsonify({'error': f'Rol inválido. Debe ser uno de: {", ".join(valid_roles)}'}), 400
    
    # Crear nuevo participante
    participant = Participant(
        project_id=project_id,
        name=data['name'],
        email=data.get('email'),
        role=data['role']
    )
    
    db.session.add(participant)
    db.session.commit()
    
    return jsonify({
        'message': 'Participante agregado exitosamente',
        'participant': participant.to_dict()
    }), 201

@participants_bp.route('/<int:project_id>/participants', methods=['GET'])
@jwt_required()
@project_access_required
def get_participants(project_id):
    """
    Obtiene todos los participantes de un proyecto
    """
    participants = Participant.query.filter_by(project_id=project_id).all()
    
    return jsonify({
        'participants': [participant.to_dict() for participant in participants]
    }), 200

@participants_bp.route('/participants/<int:participant_id>', methods=['GET'])
@jwt_required()
def get_participant(participant_id):
    """
    Obtiene un participante específico
    """
    user_id = get_jwt_identity()
    
    # Obtener participante
    participant = Participant.query.get(participant_id)
    
    if not participant:
        return jsonify({'error': 'Participante no encontrado'}), 404
    
    # Verificar permisos
    project = Project.query.get(participant.project_id)
    if not project or (project.user_id != user_id and not Participant.query.filter_by(
            project_id=participant.project_id,
            user_id=user_id).first()):
        return jsonify({'error': 'No tienes permiso para ver este participante'}), 403
    
    return jsonify({
        'participant': participant.to_dict()
    }), 200

@participants_bp.route('/participants/<int:participant_id>', methods=['PUT'])
@jwt_required()
def update_participant(participant_id):
    """
    Actualiza un participante existente
    """
    data = request.get_json()
    user_id = get_jwt_identity()
    
    # Obtener participante
    participant = Participant.query.get(participant_id)
    
    if not participant:
        return jsonify({'error': 'Participante no encontrado'}), 404
    
    # Verificar permisos
    project = Project.query.get(participant.project_id)
    if not project or (project.user_id != user_id and not Participant.query.filter_by(
            project_id=participant.project_id,
            user_id=user_id,
            role='administrator').first()):
        return jsonify({'error': 'No tienes permiso para modificar este participante'}), 403
    
    # Actualizar campos si están presentes
    if 'name' in data:
        participant.name = data['name']
    
    if 'email' in data:
        participant.email = data['email']
    
    if 'role' in data:
        valid_roles = ['administrator', 'collaborator', 'external']
        if data['role'] not in valid_roles:
            return jsonify({'error': f'Rol inválido. Debe ser uno de: {", ".join(valid_roles)}'}), 400
        participant.role = data['role']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Participante actualizado exitosamente',
        'participant': participant.to_dict()
    }), 200

@participants_bp.route('/participants/<int:participant_id>', methods=['DELETE'])
@jwt_required()
def delete_participant(participant_id):
    """
    Elimina un participante
    """
    user_id = get_jwt_identity()
    
    # Obtener participante
    participant = Participant.query.get(participant_id)
    
    if not participant:
        return jsonify({'error': 'Participante no encontrado'}), 404
    
    # Verificar permisos
    project = Project.query.get(participant.project_id)
    if not project or (project.user_id != user_id and not Participant.query.filter_by(
            project_id=participant.project_id,
            user_id=user_id,
            role='administrator').first()):
        return jsonify({'error': 'No tienes permiso para eliminar este participante'}), 403
    
    db.session.delete(participant)
    db.session.commit()
    
    return jsonify({
        'message': 'Participante eliminado exitosamente'
    }), 200