# backend/config.py
import os

class Config:
    # Configuración general
    SECRET_KEY = os.environ.get('SECRET_KEY', 'mi_clave_secreta_por_defecto')
    
    # Configuración de la base de datos
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'mysql://user:password@localhost/project_management')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configuración JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt_clave_secreta_por_defecto')
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hora
    
class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'mysql://user:password@localhost/project_management_dev'

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'mysql://user:password@localhost/project_management_test'

class ProductionConfig(Config):
    DEBUG = False
    # En producción, asegúrate de configurar estas variables de entorno
    # SECRET_KEY = os.environ.get('SECRET_KEY')
    # SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    # JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')

config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

# backend/app.py
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import config
from models import db
from routes import register_routes

def create_app(config_name='default'):
    app = Flask(__name__,
                static_folder='../frontend/static',
                template_folder='../frontend/templates')
    
    # Configuración de la aplicación
    app.config.from_object(config[config_name])
    
    # Inicialización de extensiones
    db.init_app(app)
    jwt = JWTManager(app)
    CORS(app)
    
    # Registro de rutas
    register_routes(app)
    
    # Crear tablas en la base de datos
    with app.app_context():
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000)

# backend/routes/__init__.py
def register_routes(app):
    # Importar las rutas
    from .auth import auth_bp
    from .projects import projects_bp
    from .participants import participants_bp
    from .tasks import tasks_bp
    from .milestones import milestones_bp
    
    # Registrar los blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(projects_bp, url_prefix='/api/projects')
    app.register_blueprint(participants_bp, url_prefix='/api/participants')
    app.register_blueprint(tasks_bp, url_prefix='/api/tasks')
    app.register_blueprint(milestones_bp, url_prefix='/api/milestones')
    
    # Ruta principal para servir la aplicación frontend
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def catch_all(path):
        from flask import render_template
        return render_template('index.html')