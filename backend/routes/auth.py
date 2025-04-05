# backend/routes/auth.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Registra a un nuevo usuario
    ---
    Ejemplo de cuerpo de solicitud:
    {
        "name": "Nombre Usuario",
        "email": "usuario@ejemplo.com",
        "password": "contraseña123"
    }
    """
    data = request.get_json()
    
    # Validar datos
    if not data or not all(key in data for key in ['name', 'email', 'password']):
        return jsonify({'error': 'Datos incompletos'}), 400
    
    # Verificar si el email ya existe
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'El email ya está registrado'}), 400
    
    # Crear nuevo usuario
    user = User(
        name=data['name'],
        email=data['email']
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Generar token
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'message': 'Usuario registrado exitosamente',
        'user': user.to_dict(),
        'access_token': access_token
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Inicia sesión de usuario
    ---
    Ejemplo de cuerpo de solicitud:
    {
        "email": "usuario@ejemplo.com",
        "password": "contraseña123"
    }
    """
    data = request.get_json()
    
    # Validar datos
    if not data or not all(key in data for key in ['email', 'password']):
        return jsonify({'error': 'Datos incompletos'}), 400
    
    # Buscar usuario por email
    user = User.query.filter_by(email=data['email']).first()
    
    # Verificar credenciales
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Credenciales inválidas'}), 401
    
    # Generar token
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'message': 'Inicio de sesión exitoso',
        'user': user.to_dict(),
        'access_token': access_token
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Obtiene los datos del usuario actual autenticado
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    return jsonify({'user': user.to_dict()}), 200

# backend/utils/auth_utils.py
from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models import User

def admin_required(fn):
    """
    Decorador para proteger rutas que requieren permisos de administrador
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Se requieren permisos de administrador'}), 403
        
        return fn(*args, **kwargs)
    
    return wrapper