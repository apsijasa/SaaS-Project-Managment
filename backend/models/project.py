from . import db
from datetime import datetime

class Project(db.Model):
    __tablename__ = 'projects'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    progress = db.Column(db.Integer, default=0)  # Porcentaje de progreso (0-100)
    budget = db.Column(db.Float, default=0.0)    # Presupuesto total del proyecto
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relaciones
    participants = db.relationship('Participant', backref='project', lazy=True, cascade='all, delete-orphan')
    tasks = db.relationship('Task', backref='project', lazy=True, cascade='all, delete-orphan')
    milestones = db.relationship('Milestone', backref='project', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'user_id': self.user_id,
            'progress': self.progress,
            'budget': self.budget,
            'created_at': self.created_at.isoformat()
        }
        
    def update_progress(self):
        """Calcula el progreso del proyecto basado en las tareas"""
        if not self.tasks:
            return 0
            
        total_tasks = len(self.tasks)
        if total_tasks == 0:
            return 0
            
        completed_percentage = sum(task.progress for task in self.tasks) / total_tasks
        
        # Actualizar progreso
        self.progress = int(completed_percentage)
        return self.progress