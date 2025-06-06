from flask import Flask
from .extensions import db, cors
import os
from dotenv import load_dotenv
from pathlib import Path

# load variables from a .env file located at the project root
load_dotenv(Path(__file__).resolve().parents[2] / '.env')
def create_app(debug: bool = False):
    app = Flask(__name__)
    app.config.setdefault("DEBUG", debug)
    app.config.setdefault(
        "SQLALCHEMY_DATABASE_URI",
        os.getenv("DATABASE_URL", "sqlite:///facilita.sqlite"),
    )
    app.config.setdefault("SQLALCHEMY_TRACK_MODIFICATIONS", False)

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
    from .routes import bp as api_bp
    app.register_blueprint(api_bp, url_prefix="/api")

    @app.route("/api/ping")
    def ping():
        return {"message": "pong"}

    return app
