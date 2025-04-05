from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models import User, Project, Participant

def admin_required(fn):
    """
    Decorador para proteger rutas que requieren permisos de administrador
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # En este ejemplo no hay roles de usuario, se podría implementar
        # un campo role en la tabla User si se necesita esta funcionalidad
        
        return fn(*args, **kwargs)
    
    return wrapper

def project_access_required(fn):
    """
    Decorador para verificar que el usuario tiene acceso al proyecto
    Debe usarse en rutas que tengan el parámetro project_id
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        
        # Verificar si el ID del proyecto está en los argumentos
        project_id = kwargs.get('project_id')
        if not project_id:
            return jsonify({'error': 'ID de proyecto no proporcionado'}), 400
        
        # Verificar si el proyecto existe
        project = Project.query.get(project_id)
        if not project:
            return jsonify({'error': 'Proyecto no encontrado'}), 404
        
        # Si el usuario es el creador del proyecto, permitir acceso
        if project.user_id == user_id:
            return fn(*args, **kwargs)
        
        # Verificar si el usuario es participante del proyecto
        participant = Participant.query.filter_by(
            project_id=project_id,
            user_id=user_id
        ).first()
        
        if not participant:
            return jsonify({'error': 'No tienes permiso para acceder a este proyecto'}), 403
        
        # Permitir acceso
        return fn(*args, **kwargs)
    
    return wrapper

def project_admin_required(fn):
    """
    Decorador para verificar que el usuario es administrador del proyecto
    Debe usarse en rutas que tengan el parámetro project_id
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        
        # Verificar si el ID del proyecto está en los argumentos
        project_id = kwargs.get('project_id')
        if not project_id:
            return jsonify({'error': 'ID de proyecto no proporcionado'}), 400
        
        # Verificar si el proyecto existe
        project = Project.query.get(project_id)
        if not project:
            return jsonify({'error': 'Proyecto no encontrado'}), 404
        
        # Si el usuario es el creador del proyecto, permitir acceso
        if project.user_id == user_id:
            return fn(*args, **kwargs)
        
        # Verificar si el usuario es administrador del proyecto
        participant = Participant.query.filter_by(
            project_id=project_id,
            user_id=user_id,
            role='administrator'
        ).first()
        
        if not participant:
            return jsonify({'error': 'Necesitas ser administrador del proyecto para realizar esta acción'}), 403
        
        # Permitir acceso
        return fn(*args, **kwargs)
    
    return wrapper