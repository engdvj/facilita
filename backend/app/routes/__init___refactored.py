from flask import Blueprint
from . import auth, links, categories, users, files, theme, colors, schedules

def create_api_blueprint():
    """Create and configure the main API blueprint with all sub-routes."""
    bp = Blueprint("api", __name__)
    
    # Register auth routes
    bp.register_blueprint(auth.bp, url_prefix="/auth")
    
    # Register entity routes
    bp.register_blueprint(links.bp, url_prefix="/links")
    bp.register_blueprint(categories.bp, url_prefix="/categories")
    bp.register_blueprint(colors.bp, url_prefix="/colors")
    bp.register_blueprint(users.bp, url_prefix="/users")
    bp.register_blueprint(schedules.bp, url_prefix="/schedules")
    
    # Register file and theme routes
    bp.register_blueprint(files.bp, url_prefix="/files")
    bp.register_blueprint(theme.bp, url_prefix="/theme")
    
    # Health check endpoint
    @bp.route("/ping")
    def ping():
        return {"message": "pong"}
    
    return bp