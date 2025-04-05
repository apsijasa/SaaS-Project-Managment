from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash
from functools import wraps

# Inicialización de Flask y configuración de la base de datos
app = Flask(__name__)
app.config['SECRET_KEY'] = 'clave_secreta_para_proyecto'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///proyecto.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Modelo de Usuario (debe ser idéntico al del módulo de registro)
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    fecha_registro = db.Column(db.DateTime)
    
    def __repr__(self):
        return f'<Usuario {self.nombre}>'

# Decorador para verificar si el usuario está logueado
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'usuario_id' not in session:
            flash('Por favor inicia sesión para acceder a esta página', 'error')
            return redirect(url_for('mostrar_login'))
        return f(*args, **kwargs)
    return decorated_function

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

# Ruta de ejemplo protegida
@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', nombre=session.get('usuario_nombre'))

if __name__ == '__main__':
    app.run(debug=True)