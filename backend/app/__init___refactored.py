"""Refactored Flask application factory."""

from flask import Flask, send_from_directory
from pathlib import Path

from .extensions import db, cors
from .utils.config import load_environment, get_config_paths, configure_app
from .utils.database import initialize_database


def create_app(debug: bool = False):
    """Create and configure Flask application."""
    
    # Load environment variables
    load_environment()
    
    # Get paths
    paths = get_config_paths()
    dist_dir = paths['dist_dir']
    
    # Create Flask app with optional static files
    static_folder = str(dist_dir) if dist_dir.exists() else None
    static_url_path = "" if dist_dir.exists() else None
    
    app = Flask(
        __name__, 
        static_folder=static_folder, 
        static_url_path=static_url_path
    )
    
    # Configure application
    configure_app(app, debug)
    
    # Initialize extensions
    db.init_app(app)
    cors.init_app(app)
    
    # Initialize database
    with app.app_context():
        initialize_database()
    
    # Register blueprints
    register_blueprints(app)
    
    # Register frontend routes
    if dist_dir.exists():
        register_frontend_routes(app, dist_dir)
    
    return app


def register_blueprints(app):
    """Register all application blueprints."""
    from .routes import create_api_blueprint
    
    # Register API blueprint
    app.register_blueprint(create_api_blueprint(), url_prefix="/api")
    
    # Health check endpoint
    @app.route("/api/ping")
    def ping():
        return {"message": "pong"}


def register_frontend_routes(app, dist_dir):
    """Register frontend serving routes."""
    
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def frontend(path: str):
        """Serve frontend files or fallback to index.html for SPA routing."""
        target = dist_dir / path
        
        if path and target.exists() and target.is_file():
            return send_from_directory(dist_dir, path)
        
        return send_from_directory(dist_dir, "index.html")