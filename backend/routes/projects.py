# backend/routes/projects.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Project, User
from datetime import datetime

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('/', methods=['POST'])
@jwt_required()
def create_project():
    """
    Crea un nuevo proyecto
    ---
    Ejemplo de cuerpo de solicitud:
    {
        "name": "Nombre del Proyecto",
        "start_date": "2023-01-01",
        "end_date": "2023-12-31"
    }
    """
    data = request.get_json()
    user_id = get_jwt_identity()
    
    # Validar datos
    if not data or not all(key in data for key in ['name', 'start_date', 'end_date']):
        return jsonify({'error': 'Datos incompletos'}), 400
    
    try:
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        
        if start_date > end_date:
            return jsonify({'error': 'La fecha de inicio debe ser anterior a la fecha de término'}), 400
        
        # Crear nuevo proyecto
        project = Project(
            name=data['name'],
            start_date=start_date,
            end_date=end_date,
            user_id=user_id
        )
        
        db.session.add(project)
        db.session.commit()
        
        return jsonify({
            'message': 'Proyecto creado exitosamente',
            'project': project.to_dict()
        }), 201
        
    except ValueError:
        return jsonify({'error': 'Formato de fecha inválido. Utilice YYYY-MM-DD'}), 400

@projects_bp.route('/', methods=['GET'])
@jwt_required()
def get_projects():
    """
    Obtiene todos los proyectos del usuario actual
    """
    user_id = get_jwt_identity()
    projects = Project.query.filter_by(user_id=user_id).all()
    
    return jsonify({
        'projects': [project.to_dict() for project in projects]
    }), 200

@projects_bp.route('/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    """
    Obtiene un proyecto específico
    """
    user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    
    if not project:
        return jsonify({'error': 'Proyecto no encontrado'}), 404
    
    return jsonify({
        'project': project.to_dict()
    }), 200

@projects_bp.route('/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    """
    Actualiza un proyecto existente
    """
    data = request.get_json()
    user_id = get_jwt_identity()
    
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    
    if not project:
        return jsonify({'error': 'Proyecto no encontrado'}), 404
    
    # Actualizar campos si están presentes
    if 'name' in data:
        project.name = data['name']
    
    if 'start_date' in data:
        try:
            project.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Formato de fecha de inicio inválido. Utilice YYYY-MM-DD'}), 400
    
    if 'end_date' in data:
        try:
            project.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Formato de fecha de término inválido. Utilice YYYY-MM-DD'}), 400
    
    # Validar fechas
    if project.start_date > project.end_date:
        return jsonify({'error': 'La fecha de inicio debe ser anterior a la fecha de término'}), 400
    
    db.session.commit()
    
    return jsonify({
        'message': 'Proyecto actualizado exitosamente',
        'project': project.to_dict()
    }), 200

@projects_bp.route('/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    """
    Elimina un proyecto
    """
    user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    
    if not project:
        return jsonify({'error': 'Proyecto no encontrado'}), 404
    
    db.session.delete(project)
    db.session.commit()
    
    return jsonify({
        'message': 'Proyecto eliminado exitosamente'
    }), 200

@projects_bp.route('/<int:project_id>/timeline', methods=['GET'])
@jwt_required()
def get_project_timeline(project_id):
    """
    Obtiene datos para el gráfico de línea de tiempo del proyecto
    Parámetros de consulta opcionales:
    - view: 'quarterly', 'biannual', 'annual' (por defecto 'quarterly')
    """
    from models import Task, Milestone
    
    user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    
    if not project:
        return jsonify({'error': 'Proyecto no encontrado'}), 404
    
    # Obtener el tipo de vista solicitada
    view = request.args.get('view', 'quarterly')
    
    # Obtener tareas y hitos del proyecto
    tasks = Task.query.filter_by(project_id=project_id).all()
    milestones = Milestone.query.filter_by(project_id=project_id).all()
    
    # Datos para la línea de tiempo
    timeline_data = {
        'project': project.to_dict(),
        'tasks': [task.to_dict() for task in tasks],
        'milestones': [milestone.to_dict() for milestone in milestones],
        'view': view
    }
    
    return jsonify(timeline_data), 200

# backend/routes/participants.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Participant, Project

participants_bp = Blueprint('participants', __name__)

@participants_bp.route('/<int:project_id>/participants', methods=['POST'])
@jwt_required()
def create_participant(project_id):
    """
    Agrega un participante a un proyecto
    ---
    Ejemplo de cuerpo de solicitud:
    {
        "name": "Nombre Participante",
        "role": "administrator"  // administrator, collaborator, external
    }
    """
    data = request.get_json()
    user_id = get_jwt_identity()
    
    # Validar datos
    if not data or not all(key in data for key in ['name', 'role']):
        return jsonify({'error': 'Datos incompletos'}), 400
    
    # Verificar si el proyecto existe y pertenece al usuario actual
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
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
def get_participants(project_id):
    """
    Obtiene todos los participantes de un proyecto
    """
    user_id = get_jwt_identity()
    
    # Verificar si el proyecto existe y pertenece al usuario actual
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    if not project:
        return jsonify({'error': 'Proyecto no encontrado'}), 404
    
    participants = Participant.query.filter_by(project_id=project_id).all()
    
    return jsonify({
        'participants': [participant.to_dict() for participant in participants]
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
    project = Project.query.filter_by(id=participant.project_id, user_id=user_id).first()
    if not project:
        return jsonify({'error': 'No tienes permiso para modificar este participante'}), 403
    
    # Actualizar campos si están presentes
    if 'name' in data:
        participant.name = data['name']
    
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
    project = Project.query.filter_by(id=participant.project_id, user_id=user_id).first()
    if not project:
        return jsonify({'error': 'No tienes permiso para eliminar este participante'}), 403
    
    db.session.delete(participant)
    db.session.commit()
    
    return jsonify({
        'message': 'Participante eliminado exitosamente'
    }), 200