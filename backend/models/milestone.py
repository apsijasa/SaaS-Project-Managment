from . import db
from datetime import datetime, date

class Milestone(db.Model):
    __tablename__ = 'milestones'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    responsible_id = db.Column(db.Integer, db.ForeignKey('participants.id'), nullable=True)
    date = db.Column(db.Date, nullable=False)
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'description': self.description,
            'responsible_id': self.responsible_id,
            'responsible_name': self.responsible.name if self.responsible else None,
            'date': self.date.isoformat(),
            'completed': self.completed,
            'created_at': self.created_at.isoformat()
        }
    
    @property
    def is_upcoming(self):
        """Verifica si el hito está próximo a ocurrir (en los próximos 7 días)"""
        today = date.today()
        days_until = (self.date - today).days
        return 0 <= days_until <= 7 and not self.completed
    
    @property
    def is_overdue(self):
        """Verifica si el hito está vencido"""
        return date.today() > self.date and not self.completed