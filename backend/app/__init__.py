from flask import Flask, send_from_directory

from .extensions import db, cors
import os
from dotenv import load_dotenv
from pathlib import Path

# load variables from a .env file located at the project root
load_dotenv(Path(__file__).resolve().parents[2] / '.env')
ROOT = Path(__file__).resolve().parents[2]
DIST_DIR = ROOT / "frontend" / "dist"
UPLOAD_DIR = ROOT / "uploads"

def create_app(debug: bool = False):
    static_folder = str(DIST_DIR) if DIST_DIR.exists() else None
    static_url_path = "" if DIST_DIR.exists() else None
    app = Flask(__name__, static_folder=static_folder, static_url_path=static_url_path)
    app.config.setdefault("DEBUG", debug)
    app.config.setdefault(
        "SQLALCHEMY_DATABASE_URI",
        os.getenv("DATABASE_URL", "sqlite:///facilita.sqlite"),
    )
    app.config.setdefault("SQLALCHEMY_TRACK_MODIFICATIONS", False)
    app.config.setdefault("UPLOAD_FOLDER", str(UPLOAD_DIR))
    UPLOAD_DIR.mkdir(exist_ok=True)

    secret = os.getenv("SECRET_KEY")
    if not secret:
        if app.config.get("DEBUG"):
            secret = "facilita-dev-secret"
            print(
                "WARNING: SECRET_KEY not set; using development default",
                flush=True,
            )
        else:
            raise RuntimeError("SECRET_KEY environment variable not set")
    app.config["SECRET_KEY"] = secret

    db.init_app(app)
    cors.init_app(app)

    from . import models

    # ensure all tables exist so new models work without rerunning setup_db
    with app.app_context():
        db.create_all()
    from .routes import create_api_blueprint
    app.register_blueprint(create_api_blueprint(), url_prefix="/api")

    @app.route("/api/ping")
    def ping():
        return {"message": "pong"}

    if DIST_DIR.exists():
        @app.route("/", defaults={"path": ""})
        @app.route("/<path:path>")
        def frontend(path: str):
            target = DIST_DIR / path
            if path and target.exists():
                return send_from_directory(DIST_DIR, path)
            return send_from_directory(DIST_DIR, "index.html")

    return app
