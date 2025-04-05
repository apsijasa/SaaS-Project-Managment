# backend/routes/tasks.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Task, Subtask, Project, Participant
from datetime import datetime

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/<int:project_id>/tasks', methods=['POST'])
@jwt_required()
def create_task(project_id):
    """
    Crea una nueva tarea en un proyecto
    ---
    Ejemplo de cuerpo de solicitud:
    {
        "name": "Nombre de la tarea",
        "start_date": "2023-01-01",
        "end_date": "2023-02-01",
        "assignee_id": 1,  // ID del participante asignado (opcional)
        "budget": 1000.00  // Presupuesto asignado (opcional)
    }
    """
    data = request.get_json()
    user_id = get_jwt_identity()
    
    # Validar datos
    if not data or not all(key in data for key in ['name', 'start_date', 'end_date']):
        return jsonify({'error': 'Datos incompletos'}), 400
    
    # Verificar si el proyecto existe y pertenece al usuario actual
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    if not project:
        return jsonify({'error': 'Proyecto no encontrado'}), 404
    
    try:
        # Convertir fechas
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        
        # Validar fechas
        if start_date > end_date:
            return jsonify({'error': 'La fecha de inicio debe ser anterior a la fecha de término'}), 400
        
        # Validar que estén dentro del rango del proyecto
        if start_date < project.start_date or end_date > project.end_date:
            return jsonify({'error': 'Las fechas de la tarea deben estar dentro del rango del proyecto'}), 400
        
        # Validar el participante asignado si se proporciona
        assignee_id = data.get('assignee_id')
        if assignee_id:
            assignee = Participant.query.filter_by(id=assignee_id, project_id=project_id).first()
            if not assignee:
                return jsonify({'error': 'Participante asignado no encontrado en este proyecto'}), 400
        
        # Crear nueva tarea
        task = Task(
            project_id=project_id,
            name=data['name'],
            start_date=start_date,
            end_date=end_date,
            assignee_id=assignee_id,
            budget=data.get('budget', 0.0),
            progress=0  # Inicia con 0% de progreso
        )
        
        db.session.add(task)
        db.session.commit()
        
        return jsonify({
            'message': 'Tarea creada exitosamente',
            'task': task.to_dict()
        }), 201
        
    except ValueError:
        return jsonify({'error': 'Formato de fecha inválido. Utilice YYYY-MM-DD'}), 400

@tasks_bp.route('/<int:project_id>/tasks', methods=['GET'])
@jwt_required()
def get_tasks(project_id):
    """
    Obtiene todas las tareas de un proyecto
    """
    user_id = get_jwt_identity()
    
    # Verificar si el proyecto existe y pertenece al usuario actual
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    if not project:
        return jsonify({'error': 'Proyecto no encontrado'}), 404
    
    tasks = Task.query.filter_by(project_id=project_id).all()
    
    return jsonify({
        'tasks': [task.to_dict() for task in tasks]
    }), 200

@tasks_bp.route('/tasks/<int:task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    """
    Obtiene una tarea específica
    """
    user_id = get_jwt_identity()
    
    # Obtener tarea
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({'error': 'Tarea no encontrada'}), 404
    
    # Verificar permisos
    project = Project.query.filter_by(id=task.project_id, user_id=user_id).first()
    if not project:
        return jsonify({'error': 'No tienes permiso para ver esta tarea'}), 403
    
    return jsonify({
        'task': task.to_dict()
    }), 200

@tasks_bp.route('/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    """
    Actualiza una tarea existente
    """
    data = request.get_json()
    user_id = get_jwt_identity()
    
    # Obtener tarea
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({'error': 'Tarea no encontrada'}), 404
    
    # Verificar permisos
    project = Project.query.filter_by(id=task.project_id, user_id=user_id).first()
    if not project:
        return jsonify({'error': 'No tienes permiso para modificar esta tarea'}), 403
    
    # Actualizar campos si están presentes
    if 'name' in data:
        task.name = data['name']
    
    # Actualizar fechas si se proporcionan
    try:
        if 'start_date' in data:
            task.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        
        if 'end_date' in data:
            task.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        
        # Validar fechas
        if task.start_date > task.end_date:
            return jsonify({'error': 'La fecha de inicio debe ser anterior a la fecha de término'}), 400
        
        # Validar que estén dentro del rango del proyecto
        if task.start_date < project.start_date or task.end_date > project.end_date:
            return jsonify({'error': 'Las fechas de la tarea deben estar dentro del rango del proyecto'}), 400
    except ValueError:
        return jsonify({'error': 'Formato de fecha inválido. Utilice YYYY-MM-DD'}), 400
    
    # Actualizar participante asignado si se proporciona
    if 'assignee_id' in data:
        assignee_id = data['assignee_id']
        if assignee_id:
            assignee = Participant.query.filter_by(id=assignee_id, project_id=task.project_id).first()
            if not assignee:
                return jsonify({'error': 'Participante asignado no encontrado en este proyecto'}), 400
        task.assignee_id = assignee_id
    
    # Actualizar progreso si se proporciona
    if 'progress' in data:
        progress = data['progress']
        if not isinstance(progress, int) or progress < 0 or progress > 100:
            return jsonify({'error': 'El progreso debe ser un número entero entre 0 y 100'}), 400
        task.progress = progress
    
    # Actualizar presupuesto si se proporciona
    if 'budget' in data:
        try:
            budget = float(data['budget'])
            if budget < 0:
                return jsonify({'error': 'El presupuesto no puede ser negativo'}), 400
            task.budget = budget
        except ValueError:
            return jsonify({'error': 'El presupuesto debe ser un número válido'}), 400
    
    db.session.commit()
    
    return jsonify({
        'message': 'Tarea actualizada exitosamente',
        'task': task.to_dict()
    }), 200

@tasks_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    """
    Elimina una tarea
    """
    user_id = get_jwt_identity()
    
    # Obtener tarea
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({'error': 'Tarea no encontrada'}), 404
    
    # Verificar permisos
    project = Project.query.filter_by(id=task.project_id, user_id=user_id).first()
    if not project:
        return jsonify({'error': 'No tienes permiso para eliminar esta tarea'}), 403
    
    db.session.delete(task)
    db.session.commit()
    
    return jsonify({
        'message': 'Tarea eliminada exitosamente'
    }), 200

@tasks_bp.route('/tasks/<int:task_id>/subtasks', methods=['POST'])
@jwt_required()
def create_subtask(task_id):
    """
    Crea una nueva subtarea dentro de una tarea
    ---
    Ejemplo de cuerpo de solicitud:
    {
        "name": "Nombre de la subtarea",
        "start_date": "2023-01-01",
        "end_date": "2023-01-15",
        "budget": 500.00  // Presupuesto asignado (opcional)
    }
    """
    data = request.get_json()
    user_id = get_jwt_identity()
    
    # Validar datos
    if not data or not all(key in data for key in ['name', 'start_date', 'end_date']):
        return jsonify({'error': 'Datos incompletos'}), 400
    
    # Obtener tarea
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({'error': 'Tarea no encontrada'}), 404
    
    # Verificar permisos
    project = Project.query.filter_by(id=task.project_id, user_id=user_id).first()
    if not project:
        return jsonify({'error': 'No tienes permiso para modificar esta tarea'}), 403
    
    try:
        # Convertir fechas
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        
        # Validar fechas
        if start_date > end_date:
            return jsonify({'error': 'La fecha de inicio debe ser anterior a la fecha de término'}), 400
        
        # Validar que estén dentro del rango de la tarea
        if start_date < task.start_date or end_date > task.end_date:
            return jsonify({'error': 'Las fechas de la subtarea deben estar dentro del rango de la tarea'}), 400
        
        # Crear nueva subtarea
        subtask = Subtask(
            task_id=task_id,
            name=data['name'],
            start_date=start_date,
            end_date=end_date,
            budget=data.get('budget', 0.0),
            progress=0  # Inicia con 0% de progreso
        )
        
        db.session.add(subtask)
        db.session.commit()
        
        return jsonify({
            'message': 'Subtarea creada exitosamente',
            'subtask': subtask.to_dict()
        }), 201
        
    except ValueError:
        return jsonify({'error': 'Formato de fecha inválido. Utilice YYYY-MM-DD'}), 400

@tasks_bp.route('/tasks/<int:task_id>/subtasks', methods=['GET'])
@jwt_required()
def get_subtasks(task_id):
    """
    Obtiene todas las subtareas de una tarea
    """
    user_id = get_jwt_identity()
    
    # Obtener tarea
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({'error': 'Tarea no encontrada'}), 404
    
    # Verificar permisos
    project = Project.query.filter_by(id=task.project_id, user_id=user_id).first()
    if not project:
        return jsonify({'error': 'No tienes permiso para ver esta tarea'}), 403
    
    subtasks = Subtask.query.filter_by(task_id=task_id).all()
    
    return jsonify({
        'subtasks': [subtask.to_dict() for subtask in subtasks]
    }), 200

@tasks_bp.route('/subtasks/<int:subtask_id>', methods=['PUT'])
@jwt_required()
def update_subtask(subtask_id):
    """
    Actualiza una subtarea existente
    """
    data = request.get_json()
    user_id = get_jwt_identity()
    
    # Obtener subtarea
    subtask = Subtask.query.get(subtask_id)
    
    if not subtask:
        return jsonify({'error': 'Subtarea no encontrada'}), 404
    
    # Obtener tarea y proyecto para verificar permisos
    task = Task.query.get(subtask.task_id)
    project = Project.query.filter_by(id=task.project_id, user_id=user_id).first()
    if not project:
        return jsonify({'error': 'No tienes permiso para modificar esta subtarea'}), 403
    
    # Actualizar campos si están presentes
    if 'name' in data:
        subtask.name = data['name']
    
    # Actualizar fechas si se proporcionan
    try:
        if 'start_date' in data:
            subtask.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        
        if 'end_date' in data:
            subtask.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        
        # Validar fechas
        if subtask.start_date > subtask.end_date:
            return jsonify({'error': 'La fecha de inicio debe ser anterior a la fecha de término'}), 400
        
        # Validar que estén dentro del rango de la tarea
        if subtask.start_date < task.start_date or subtask.end_date > task.end_date:
            return jsonify({'error': 'Las fechas de la subtarea deben estar dentro del rango de la tarea'}), 400
    except ValueError:
        return jsonify({'error': 'Formato de fecha inválido. Utilice YYYY-MM-DD'}), 400
    
    # Actualizar progreso si se proporciona
    if 'progress' in data:
        progress = data['progress']
        if not isinstance(progress, int) or progress < 0 or progress > 100:
            return jsonify({'error': 'El progreso debe ser un número entero entre 0 y 100'}), 400
        subtask.progress = progress
    
    # Actualizar presupuesto si se proporciona
    if 'budget' in data:
        try:
            budget = float(data['budget'])
            if budget < 0:
                return jsonify({'error': 'El presupuesto no puede ser negativo'}), 400
            subtask.budget = budget
        except ValueError:
            return jsonify({'error': 'El presupuesto debe ser un número válido'}), 400
    
    db.session.commit()
    
    return jsonify({
        'message': 'Subtarea actualizada exitosamente',
        'subtask': subtask.to_dict()
    }), 200

@tasks_bp.route('/subtasks/<int:subtask_id>', methods=['DELETE'])
@jwt_required()
def delete_subtask(subtask_id):
    """
    Elimina una subtarea
    """
    user_id = get_jwt_identity()
    
    # Obtener subtarea
    subtask = Subtask.query.get(subtask_id)
    
    if not subtask:
        return jsonify({'error': 'Subtarea no encontrada'}), 404
    
    # Obtener tarea y proyecto para verificar permisos
    task = Task.query.get(subtask.task_id)
    project = Project.query.filter_by(id=task.project_id, user_id=user_id).first()
    if not project:
        return jsonify({'error': 'No tienes permiso para eliminar esta subtarea'}), 403
    
    db.session.delete(subtask)
    db.session.commit()
    
    return jsonify({
        'message': 'Subtarea eliminada exitosamente'
    }), 200