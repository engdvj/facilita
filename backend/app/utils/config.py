"""Configuration utilities."""

import os
from pathlib import Path


def load_environment():
    """Load environment variables from .env file."""
    from dotenv import load_dotenv
    
    # Load variables from a .env file located at the project root
    env_path = Path(__file__).resolve().parents[3] / ".env"
    load_dotenv(env_path)


def get_config_paths():
    """Get important application paths."""
    ROOT = Path(__file__).resolve().parents[3]
    DIST_DIR = ROOT / "frontend" / "dist"
    UPLOAD_DIR = ROOT / "uploads"
    
    return {
        'root': ROOT,
        'dist_dir': DIST_DIR,
        'upload_dir': UPLOAD_DIR
    }


def configure_app(app, debug=False):
    """Configure Flask application with all necessary settings."""
    paths = get_config_paths()
    
    # Basic Flask configuration
    app.config.setdefault("DEBUG", debug)
    app.config.setdefault(
        "SQLALCHEMY_DATABASE_URI",
        os.getenv("DATABASE_URL", "sqlite:///facilita.sqlite"),
    )
    app.config.setdefault("SQLALCHEMY_TRACK_MODIFICATIONS", False)
    
    # Upload configuration
    app.config.setdefault("UPLOAD_FOLDER", str(paths['upload_dir']))
    paths['upload_dir'].mkdir(exist_ok=True)
    
    # Security configuration
    configure_security(app, debug)
    
    # Static files configuration
    configure_static_files(app, paths['dist_dir'])


def configure_security(app, debug):
    """Configure security settings."""
    secret = os.getenv("SECRET_KEY")
    
    if not secret:
        if debug:
            secret = "facilita-dev-secret"
            print(
                "WARNING: SECRET_KEY not set; using development default",
                flush=True,
            )
        else:
            raise RuntimeError("SECRET_KEY environment variable not set")
    
    app.config["SECRET_KEY"] = secret
    
    # Session configuration for cross-origin support
    app.config.setdefault("SESSION_COOKIE_SAMESITE", "None")
    app.config.setdefault("SESSION_COOKIE_SECURE", not debug)
    
    domain = os.getenv("SESSION_COOKIE_DOMAIN")
    if domain:
        app.config.setdefault("SESSION_COOKIE_DOMAIN", domain)


def configure_static_files(app, dist_dir):
    """Configure static file serving."""
    if dist_dir.exists():
        app.static_folder = str(dist_dir)
        app.static_url_path = ""
    else:
        app.static_folder = None
        app.static_url_path = None