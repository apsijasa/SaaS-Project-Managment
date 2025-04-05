from . import db
from datetime import datetime

class Participant(db.Model):
    __tablename__ = 'participants'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=True)
    role = db.Column(db.String(20), nullable=False)  # 'administrator', 'collaborator', 'external'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relaciones
    tasks = db.relationship('Task', backref='assignee', lazy=True)
    milestones = db.relationship('Milestone', backref='responsible', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat(),
            'tasks_count': len(self.tasks),
            'milestones_count': len(self.milestones)
        }