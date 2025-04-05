from . import db
from datetime import datetime, date

class Task(db.Model):
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    progress = db.Column(db.Integer, default=0)  # Porcentaje de progreso (0-100)
    budget = db.Column(db.Float, default=0.0)    # Presupuesto asignado
    assignee_id = db.Column(db.Integer, db.ForeignKey('participants.id'), nullable=True)
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relaciones
    subtasks = db.relationship('Subtask', backref='task', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'description': self.description,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'progress': self.progress,
            'budget': self.budget,
            'assignee_id': self.assignee_id,
            'assignee_name': self.assignee.name if self.assignee else None,
            'completed': self.completed,
            'created_at': self.created_at.isoformat(),
            'subtasks_count': len(self.subtasks)
        }
    
    @property
    def is_overdue(self):
        """Verifica si la tarea está vencida"""
        return date.today() > self.end_date and not self.completed
    
    def update_progress(self):
        """Actualiza el progreso basado en subtareas"""
        if not self.subtasks:
            return self.progress
            
        total_subtasks = len(self.subtasks)
        if total_subtasks == 0:
            return self.progress
            
        completed_percentage = sum(subtask.progress for subtask in self.subtasks) / total_subtasks
        
        # Actualizar progreso
        self.progress = int(completed_percentage)
        
        # Si el progreso es 100%, marcar como completada
        if self.progress >= 100:
            self.completed = True
        
        return self.progress