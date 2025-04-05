from . import db
from datetime import datetime, date

class Subtask(db.Model):
    __tablename__ = 'subtasks'
    
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    progress = db.Column(db.Integer, default=0)  # Porcentaje de progreso (0-100)
    budget = db.Column(db.Float, default=0.0)    # Presupuesto asignado
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'task_id': self.task_id,
            'name': self.name,
            'description': self.description,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'progress': self.progress,
            'budget': self.budget,
            'completed': self.completed,
            'created_at': self.created_at.isoformat()
        }
    
    @property
    def is_overdue(self):
        """Verifica si la subtarea está vencida"""
        return date.today() > self.end_date and not self.completed