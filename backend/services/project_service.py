from models import db, Project, Task, Milestone, Participant
from datetime import datetime

class ProjectService:
    """Servicio para gestionar proyectos"""
    
    @staticmethod
    def create_project(user_id, name, start_date, end_date, description=None, budget=0.0):
        """
        Crea un nuevo proyecto
        
        Args:
            user_id (int): ID del usuario creador
            name (str): Nombre del proyecto
            start_date (str/date): Fecha de inicio en formato YYYY-MM-DD
            end_date (str/date): Fecha de fin en formato YYYY-MM-DD
            description (str, optional): Descripción del proyecto
            budget (float, optional): Presupuesto inicial
            
        Returns:
            tuple: (project, error_message)
        """
        try:
            # Convertir fechas si son strings
            if isinstance(start_date, str):
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            if isinstance(end_date, str):
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            
            # Validar fechas
            if start_date > end_date:
                return None, "La fecha de inicio debe ser anterior a la fecha de término"
            
            # Crear proyecto
            project = Project(
                name=name,
                description=description,
                start_date=start_date,
                end_date=end_date,
                user_id=user_id,
                budget=float(budget) if budget else 0.0,
                progress=0
            )
            
            # Crear participante administrador (el creador)
            admin = Participant(
                name="Administrador", 
                role="administrator",
                project=project
            )
            
            # Guardar en la base de datos
            db.session.add(project)
            db.session.add(admin)
            db.session.commit()
            
            return project, None
            
        except Exception as e:
            db.session.rollback()
            return None, f"Error al crear proyecto: {str(e)}"
    
    @staticmethod
    def get_project_statistics(project_id):
        """
        Obtiene estadísticas del proyecto
        
        Args:
            project_id (int): ID del proyecto
            
        Returns:
            dict: Estadísticas del proyecto
        """
        stats = {
            'total_tasks': 0,
            'completed_tasks': 0,
            'pending_tasks': 0,
            'overdue_tasks': 0,
            'upcoming_milestones': 0,
            'total_milestones': 0,
            'total_participants': 0
        }
        
        # Contar tareas
        tasks = Task.query.filter_by(project_id=project_id).all()
        stats['total_tasks'] = len(tasks)
        stats['completed_tasks'] = sum(1 for t in tasks if t.completed)
        stats['pending_tasks'] = stats['total_tasks'] - stats['completed_tasks']
        stats['overdue_tasks'] = sum(1 for t in tasks if t.is_overdue)
        
        # Contar hitos
        milestones = Milestone.query.filter_by(project_id=project_id).all()
        stats['total_milestones'] = len(milestones)
        stats['upcoming_milestones'] = sum(1 for m in milestones if m.is_upcoming)
        
        # Contar participantes
        stats['total_participants'] = Participant.query.filter_by(project_id=project_id).count()
        
        return stats
        
    @staticmethod
    def calculate_project_progress(project_id):
        """
        Calcula el progreso del proyecto basado en las tareas
        
        Args:
            project_id (int): ID del proyecto
            
        Returns:
            int: Porcentaje de progreso (0-100)
        """
        project = Project.query.get(project_id)
        if not project:
            return 0
            
        return project.update_progress()