from models import db, User
from flask_jwt_extended import create_access_token
from datetime import timedelta
import re

class AuthService:
    """Servicio para manejar la autenticación de usuarios"""
    
    @staticmethod
    def register_user(name, email, password):
        """
        Registra un nuevo usuario en el sistema
        
        Args:
            name (str): Nombre del usuario
            email (str): Email del usuario
            password (str): Contraseña sin encriptar
            
        Returns:
            tuple: (user, token, error_message)
        """
        # Validar email
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            return None, None, "Formato de email inválido"
        
        # Validar contraseña
        if len(password) < 6:
            return None, None, "La contraseña debe tener al menos 6 caracteres"
        
        # Verificar si el email ya existe
        if User.query.filter_by(email=email).first():
            return None, None, "El email ya está registrado"
        
        try:
            # Crear nuevo usuario
            user = User(name=name, email=email)
            user.set_password(password)
            
            # Guardar en la base de datos
            db.session.add(user)
            db.session.commit()
            
            # Generar token
            token = create_access_token(
                identity=user.id,
                expires_delta=timedelta(days=1)
            )
            
            return user, token, None
            
        except Exception as e:
            db.session.rollback()
            return None, None, f"Error al registrar: {str(e)}"
    
    @staticmethod
    def login_user(email, password):
        """
        Inicia sesión del usuario
        
        Args:
            email (str): Email del usuario
            password (str): Contraseña
            
        Returns:
            tuple: (user, token, error_message)
        """
        # Buscar usuario por email
        user = User.query.filter_by(email=email).first()
        
        # Verificar si el usuario existe y la contraseña es correcta
        if not user or not user.check_password(password):
            return None, None, "Email o contraseña incorrectos"
        
        # Generar token
        token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(days=1)
        )
        
        return user, token, None