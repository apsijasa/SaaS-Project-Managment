import sys
import platform

def check_library(library_name):
    try:
        library = __import__(library_name)
        version = getattr(library, '__version__', 'Versión no disponible')
        return f"{library_name}: {version}"
    except ImportError:
        return f"{library_name}: No instalado"

libraries_to_check = [
    'sqlalchemy', 'flask', 'flask_sqlalchemy', 'flask_cors', 
    'flask_jwt_extended', 'pymysql', 'dotenv', 'cryptography', 
    'markdown', 'email_validator', 'wtforms'
]

print("Diagnóstico del Sistema:")
print(f"Python: {sys.version}")
print(f"Plataforma: {platform.platform()}")
print("\nVersiones de Bibliotecas:")
for lib in libraries_to_check:
    print(check_library(lib))
