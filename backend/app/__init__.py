from flask import Flask, send_from_directory
from sqlalchemy import inspect, text

from .extensions import db, cors
import os
from dotenv import load_dotenv
from pathlib import Path

# load variables from a .env file located at the project root
load_dotenv(Path(__file__).resolve().parents[2] / ".env")
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
    from .models import User

    # ensure all tables exist and add new columns if missing
    with app.app_context():
        db.create_all()
        inspector = inspect(db.engine)
        color_cols = [c["name"] for c in inspector.get_columns("color")]
        if "name" not in color_cols:
            db.session.execute(text("ALTER TABLE color ADD COLUMN name VARCHAR(50)"))
            db.session.commit()
        category_cols = [c["name"] for c in inspector.get_columns("category")]
        if "admin_only" not in category_cols:
            db.session.execute(
                text("ALTER TABLE category ADD COLUMN admin_only BOOLEAN DEFAULT 0")
            )
            db.session.commit()
        user_cols = [c["name"] for c in inspector.get_columns("user")]
        if "is_admin" not in user_cols:
            db.session.execute(
                text("ALTER TABLE user ADD COLUMN is_admin BOOLEAN DEFAULT 0")
            )
            db.session.commit()
            # make sure existing admin account keeps privileges
            db.session.execute(
                text("UPDATE user SET is_admin = 1 WHERE username = 'admin'")
            )
            db.session.commit()
        if "theme" not in user_cols:
            db.session.execute(text("ALTER TABLE user ADD COLUMN theme TEXT"))
            db.session.commit()
        link_cols = [c["name"] for c in inspector.get_columns("link")]
        if "user_id" not in link_cols:
            db.session.execute(text("ALTER TABLE link ADD COLUMN user_id INTEGER"))
            db.session.commit()
        # ensure a default admin user exists and has admin privileges
        admin = User.query.filter_by(username="admin").first()
        if not admin:
            admin = User(username="admin", is_admin=True)
            admin.set_password("admin123")
            db.session.add(admin)
        elif not admin.is_admin:
            admin.is_admin = True
        db.session.commit()
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
