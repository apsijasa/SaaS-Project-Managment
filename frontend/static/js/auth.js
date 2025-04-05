// frontend/static/js/auth.js

document.addEventListener('DOMContentLoaded', function() {
    // Detectar si estamos en la página de login o registro
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const registrationForm = document.getElementById('registrationForm'); // En la landing page
    
    // Configuración de la API
    const API_URL = '/api';
    
    // Función para mostrar mensajes de error o éxito
    function showMessage(message, isError = false) {
        // Crear un elemento para el mensaje
        const messageEl = document.createElement('div');
        messageEl.className = isError ? 'alert alert-danger' : 'alert alert-success';
        messageEl.textContent = message;
        
        // Insertar el mensaje al principio del formulario
        const form = loginForm || registerForm || registrationForm;
        if (form) {
            form.parentNode.insertBefore(messageEl, form);
            
            // Eliminar el mensaje después de 5 segundos
            setTimeout(() => {
                messageEl.remove();
            }, 5000);
        }
    }
    
    // Función para guardar el token y redirigir al dashboard
    function handleAuthSuccess(data) {
        // Guardar el token en localStorage
        localStorage.setItem('token', data.access_token);
        
        // Guardar información del usuario
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirigir al dashboard
        window.location.href = '/dashboard';
    }
    
    // Función para manejar errores de la API
    function handleApiError(error) {
        console.error('Error:', error);
        
        // Mostrar mensaje de error
        let errorMessage = 'Ocurrió un error. Por favor, inténtalo de nuevo.';
        
        // Intentar extraer el mensaje de error de la respuesta
        if (error.response && error.response.data && error.response.data.error) {
            errorMessage = error.response.data.error;
        } else if (typeof error === 'string') {
            errorMessage = error;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showMessage(errorMessage, true);
    }
    
    // Si estamos en la página de login, configurar el formulario
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obtener datos del formulario
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Validar datos
            if (!email || !password) {
                showMessage('Por favor, completa todos los campos.', true);
                return;
            }
            
            // Mostrar indicador de carga
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Iniciando sesión...';
            
            // Enviar solicitud a la API
            fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            })
            .then(response => {
                // Restaurar botón
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                
                if (!response.ok) {
                    // Intentar obtener el mensaje de error
                    return response.json().then(data => {
                        throw new Error(data.error || 'Credenciales inválidas');
                    });
                }
                return response.json();
            })
            .then(data => {
                handleAuthSuccess(data);
            })
            .catch(error => {
                handleApiError(error);
            });
        });
    }
    
    // Si estamos en la página de registro, configurar el formulario
    if (registerForm || registrationForm) {
        const form = registerForm || registrationForm;
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obtener datos del formulario
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Validar datos
            if (!name || !email || !password || !confirmPassword) {
                showMessage('Por favor, completa todos los campos.', true);
                return;
            }
            
            if (password !== confirmPassword) {
                showMessage('Las contraseñas no coinciden.', true);
                return;
            }
            
            if (password.length < 6) {
                showMessage('La contraseña debe tener al menos 6 caracteres.', true);
                return;
            }
            
            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showMessage('Por favor, introduce un email válido.', true);
                return;
            }
            
            // Mostrar indicador de carga
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Registrando...';
            
            // Enviar solicitud a la API
            fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            })
            .then(response => {
                // Restaurar botón
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                
                if (!response.ok) {
                    // Intentar obtener el mensaje de error
                    return response.json().then(data => {
                        throw new Error(data.error || 'Error al registrar');
                    });
                }
                return response.json();
            })
            .then(data => {
                handleAuthSuccess(data);
            })
            .catch(error => {
                handleApiError(error);
            });
        });
    }
    
    // Función para verificar si el usuario está autenticado
    function checkAuth() {
        const token = localStorage.getItem('token');
        
        if (!token) {
            // Si no hay token, redirigir al login en páginas protegidas
            if (!window.location.pathname.includes('/login') && 
                !window.location.pathname.includes('/register') && 
                !window.location.pathname.startsWith('/api') && 
                window.location.pathname !== '/') {
                window.location.href = '/login';
            }
            return;
        }
        
        // Si hay token y estamos en login o registro, redirigir al dashboard
        if (window.location.pathname.includes('/login') || 
            window.location.pathname.includes('/register')) {
            window.location.href = '/dashboard';
            return;
        }
        
        // Verificar la validez del token
        fetch(`${API_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Token inválido');
            }
            return response.json();
        })
        .then(data => {
            // Actualizar información del usuario
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Actualizar elementos de la UI con información del usuario
            updateUserUI(data.user);
        })
        .catch(error => {
            console.error('Error de autenticación:', error);
            // Limpiar localStorage y redirigir al login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            if (!window.location.pathname.includes('/login') && 
                !window.location.pathname.includes('/register') && 
                !window.location.pathname.startsWith('/api') && 
                window.location.pathname !== '/') {
                window.location.href = '/login';
            }
        });
    }
    
    // Función para actualizar elementos de la UI con información del usuario
    function updateUserUI(user) {
        // Actualizar el nombre del usuario
        const userNameElements = document.querySelectorAll('.user-name, #user-name');
        userNameElements.forEach(el => {
            if (el) el.textContent = user.name;
        });
        
        // Actualizar iniciales del usuario para el avatar
        const userInitialsElements = document.querySelectorAll('.user-initials, #user-initials');
        userInitialsElements.forEach(el => {
            if (el) {
                // Obtener iniciales a partir del nombre
                const initials = user.name.split(' ')
                    .map(name => name.charAt(0))
                    .join('')
                    .toUpperCase();
                el.textContent = initials;
            }
        });
    }
    
    // Verificar autenticación al cargar la página
    checkAuth();
    
    // Configurar botón de logout si existe
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Limpiar localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Redirigir al login
            window.location.href = '/login';
        });
    }
});