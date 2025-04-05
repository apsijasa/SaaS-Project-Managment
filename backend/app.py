from flask import Flask, render_template, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from functools import wraps
from flask import request, flash, session

# Inicialización de Flask y configuración de la base de datos
app = Flask(__name__)
app.config['SECRET_KEY'] = 'clave_secreta_para_proyecto'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///proyecto.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Modelo de Usuario
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Usuario {self.nombre}>'

# Crear todas las tablas
with app.app_context():
    db.create_all()

# Decorador para verificar si el usuario está logueado
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'usuario_id' not in session:
            flash('Por favor inicia sesión para acceder a esta página', 'error')
            return redirect(url_for('mostrar_login'))
        return f(*args, **kwargs)
    return decorated_function

# Ruta principal
@app.route('/')
def index():
    return redirect(url_for('mostrar_login'))

#=================
# MÓDULO DE REGISTRO
#=================

# Ruta para mostrar el formulario de registro
@app.route('/registro', methods=['GET'])
def mostrar_registro():
    return render_template('registro.html')

# Ruta para procesar el formulario de registro
@app.route('/registro', methods=['POST'])
def procesar_registro():
    # Obtener datos del formulario
    nombre = request.form.get('nombre')
    email = request.form.get('email')
    password = request.form.get('password')
    
    # Validación básica de datos
    if not nombre or not email or not password:
        flash('Todos los campos son obligatorios', 'error')
        return redirect(url_for('mostrar_registro'))
    
    # Verificar si el email ya existe
    usuario_existente = Usuario.query.filter_by(email=email).first()
    if usuario_existente:
        flash('El email ya está registrado. Por favor, utiliza otro email.', 'error')
        return redirect(url_for('mostrar_registro'))
    
    # Crear nuevo usuario con password hasheado
    nuevo_usuario = Usuario(
        nombre=nombre,
        email=email,
        password=generate_password_hash(password, method='pbkdf2:sha256')
    )
    
    # Guardar en la base de datos
    try:
        db.session.add(nuevo_usuario)
        db.session.commit()
        flash('¡Registro exitoso! Ahora puedes iniciar sesión.', 'success')
        return redirect(url_for('mostrar_login'))
    except Exception as e:
        db.session.rollback()
        flash(f'Error al registrar: {str(e)}', 'error')
        return redirect(url_for('mostrar_registro'))

#=================
# MÓDULO DE LOGIN
#=================

# Ruta para mostrar el formulario de login
@app.route('/login', methods=['GET'])
def mostrar_login():
    return render_template('login.html')

# Ruta para procesar el formulario de login
@app.route('/login', methods=['POST'])
def procesar_login():
    # Obtener datos del formulario
    email = request.form.get('email')
    password = request.form.get('password')
    
    # Validación básica
    if not email or not password:
        flash('Por favor ingresa email y contraseña', 'error')
        return redirect(url_for('mostrar_login'))
    
    # Buscar usuario por email
    usuario = Usuario.query.filter_by(email=email).first()
    
    # Verificar si el usuario existe y la contraseña es correcta
    if not usuario or not check_password_hash(usuario.password, password):
        flash('Email o contraseña incorrectos', 'error')
        return redirect(url_for('mostrar_login'))
    
    # Crear sesión para el usuario
    session['usuario_id'] = usuario.id
    session['usuario_nombre'] = usuario.nombre
    
    flash(f'¡Bienvenido, {usuario.nombre}!', 'success')
    return redirect(url_for('dashboard'))

# Ruta para cerrar sesión
@app.route('/logout')
def logout():
    # Eliminar datos de la sesión
    session.pop('usuario_id', None)
    session.pop('usuario_nombre', None)
    flash('Has cerrado sesión correctamente', 'success')
    return redirect(url_for('mostrar_login'))

# Ruta de ejemplo protegida (dashboard)
@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', nombre=session.get('usuario_nombre'))

if __name__ == '__main__':
    app.run(debug=True)