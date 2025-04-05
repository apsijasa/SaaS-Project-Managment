from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Importar modelos para que estén disponibles desde el módulo
from .user import User
from .project import Project
from .participant import Participant
from .task import Task
from .subtask import Subtask
from .milestone import Milestone