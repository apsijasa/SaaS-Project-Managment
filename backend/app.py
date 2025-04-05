from flask import Flask, render_template, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from os import environ
from dotenv import load_dotenv
from models import db
from routes import register_routes

# Cargar variables de entorno
load_dotenv()

def create_app(config_name='development'):
    """
    Función de fábrica para crear la aplicación Flask
    
    Args:
        config_name (str): Nombre de la configuración a utilizar (development, testing, production)
        
    Returns:
        Flask: Aplicación Flask configurada
    """
    app = Flask(__name__,
                static_folder='../frontend/static',
                template_folder='../frontend/templates')
    
    # Configuración de la aplicación
    app.config['SECRET_KEY'] = environ.get('SECRET_KEY', 'mi_clave_secreta_por_defecto')
    app.config['SQLALCHEMY_DATABASE_URI'] = environ.get('DATABASE_URL', 'sqlite:///project_management.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = environ.get('JWT_SECRET_KEY', 'jwt_clave_secreta_por_defecto')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600 * 24  # 24 horas
    
    # Inicialización de extensiones
    db.init_app(app)
    jwt = JWTManager(app)
    CORS(app)
    
    # Registro de rutas
    register_routes(app)
    
    # Crear tablas en la base de datos
    with app.app_context():
        db.create_all()
    
    # Manejador de errores para JWT
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'error': 'El token ha expirado',
            'code': 'token_expired'
        }), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        return jsonify({
            'error': 'Token inválido',
            'code': 'invalid_token'
        }), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error_string):
        return jsonify({
            'error': 'No se proporcionó token de acceso',
            'code': 'authorization_required'
        }), 401
    
    # Rutas para renderizar plantillas HTML
    @app.route('/')
    def index():
        return render_template('index.html')
    
    @app.route('/login')
    def login():
        return render_template('login.html')
    
    @app.route('/register')
    def register():
        return render_template('register.html')
    
    @app.route('/dashboard')
    def dashboard():
        return render_template('dashboard.html')
    
    @app.route('/projects')
    def projects():
        return render_template('projects.html')
    
    @app.route('/projects/<int:project_id>')
    def project(project_id):
        return render_template('project.html')
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=environ.get('FLASK_ENV') == 'development', host='0.0.0.0')