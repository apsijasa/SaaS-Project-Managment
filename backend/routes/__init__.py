def register_routes(app):
    """
    Registra todas las rutas de la API en la aplicación Flask
    
    Args:
        app (Flask): Aplicación Flask
    """
    # Importar los blueprints
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