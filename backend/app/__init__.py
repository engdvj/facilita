from flask import Flask
from .extensions import db, jwt, cors


def create_app():
    app = Flask(__name__)
    app.config.setdefault("SQLALCHEMY_DATABASE_URI", "sqlite:///facilita.sqlite")
    app.config.setdefault("SQLALCHEMY_TRACK_MODIFICATIONS", False)
    app.config.setdefault("JWT_SECRET_KEY", "change-me")

    db.init_app(app)
    jwt.init_app(app)
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
