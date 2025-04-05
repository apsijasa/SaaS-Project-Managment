import sys
import os
import platform

print("Información del Sistema:")
print(f"Sistema Operativo: {platform.system()}")
print(f"Python Executable: {sys.executable}")
print(f"Directorio Actual: {os.getcwd()}")
print(f"Entorno Virtual Activo: {sys.prefix != sys.base_prefix}")
print(f"Versión de Python: {sys.version}")
