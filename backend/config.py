import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

class Config:
    """Configuración base para todos los entornos"""
    
    # Configuración general
    SECRET_KEY = os.environ.get('SECRET_KEY', 'mi_clave_secreta_por_defecto')
    
    # Configuración de la base de datos
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///project_management.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configuración JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt_clave_secreta_por_defecto')
    JWT_ACCESS_TOKEN_EXPIRES = 3600 * 24  # 24 horas
    
    # Configuración de archivos
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB máximo para subida de archivos
    ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'rar'}

class DevelopmentConfig(Config):
    """Configuración para entorno de desarrollo"""
    
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///project_management_dev.db')

class TestingConfig(Config):
    """Configuración para entorno de pruebas"""
    
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///project_management_test.db')
    
    # Desactivar protección CSRF para pruebas
    WTF_CSRF_ENABLED = False

class ProductionConfig(Config):
    """Configuración para entorno de producción"""
    
    DEBUG = False
    
    # En producción, estas variables deben estar configuradas en el servidor
    SECRET_KEY = os.environ.get('SECRET_KEY')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    
    # En producción, se debe usar una base de datos más robusta
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    
    # Configuración de seguridad
    SESSION_COOKIE_SECURE = True
    REMEMBER_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_HTTPONLY = True

# Diccionario de configuraciones
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}