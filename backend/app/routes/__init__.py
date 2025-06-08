from flask import Blueprint, request, jsonify, session, current_app, send_from_directory
from functools import wraps
from sqlalchemy.exc import IntegrityError
from werkzeug.utils import secure_filename
from pathlib import Path

from ..extensions import db
from ..models import User, Link, Category, Color


def login_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if not session.get("user_id"):
            return {"message": "Unauthorized"}, 401
        return func(*args, **kwargs)

    return wrapper


def create_api_blueprint():
    bp = Blueprint("api", __name__)

    @bp.post("/auth/login")
    def login():
        data = request.get_json() or {}
        username = data.get("username")
        password = data.get("password")
        if not username or not password:
            return {"message": "Missing credentials"}, 400
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            session["user_id"] = user.id
            return {"message": "ok"}
        return {"message": "Invalid credentials"}, 401

    @bp.post("/auth/logout")
    def logout():
        session.pop("user_id", None)
        return {"message": "ok"}

    @bp.get("/links")
    def list_links():
        links = Link.query.all()
        return jsonify([l.to_dict() for l in links])

    @bp.post("/links")
    @login_required
    def create_link():
        data = request.get_json() or {}
        title = data.get("title")
        url = data.get("url")
        if not title or not url:
            return {"message": "Missing title or url"}, 400
        link = Link(
            title=title,
            url=url,
            category_id=data.get("category_id"),
            color=data.get("color"),
            image_url=data.get("image_url"),
        )
        db.session.add(link)
        db.session.commit()
        return link.to_dict(), 201

    @bp.patch("/links/<int:link_id>")
    @login_required
    def update_link(link_id):
        link = Link.query.get_or_404(link_id)
        data = request.get_json() or {}
        for field in ["title", "url", "category_id", "color", "image_url"]:
            if field in data:
                setattr(link, field, data[field])
        db.session.commit()
        return link.to_dict()

    @bp.delete("/links/<int:link_id>")
    @login_required
    def delete_link(link_id):
        link = Link.query.get_or_404(link_id)
        db.session.delete(link)
        db.session.commit()
        return {"message": "deleted"}

    @bp.get("/categories")
    def list_categories():
        categories = Category.query.all()
        return jsonify([
            {"id": c.id, "name": c.name, "color": c.color, "icon": c.icon}
            for c in categories
        ])

    @bp.post("/categories")
    @login_required
    def create_category():
        data = request.get_json() or {}
        name = data.get("name")
        if not name:
            return {"message": "Missing name"}, 400
        category = Category(name=name, color=data.get("color"), icon=data.get("icon"))
        db.session.add(category)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return {"message": "Category already exists"}, 400
        return {
            "id": category.id,
            "name": category.name,
            "color": category.color,
            "icon": category.icon,
        }, 201

    @bp.patch("/categories/<int:cat_id>")
    @login_required
    def update_category(cat_id):
        category = Category.query.get_or_404(cat_id)
        data = request.get_json() or {}
        for field in ["name", "color", "icon"]:
            if field in data:
                setattr(category, field, data[field])
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return {"message": "Category already exists"}, 400
        return {
            "id": category.id,
            "name": category.name,
            "color": category.color,
            "icon": category.icon,
        }

    @bp.delete("/categories/<int:cat_id>")
    @login_required
    def delete_category(cat_id):
        category = Category.query.get_or_404(cat_id)
        db.session.delete(category)
        db.session.commit()
        return {"message": "deleted"}

    @bp.get("/colors")
    def list_colors():
        colors = Color.query.all()
        return jsonify([{"id": c.id, "value": c.value} for c in colors])

    @bp.post("/colors")
    @login_required
    def create_color():
        data = request.get_json() or {}
        value = data.get("value")
        if not value:
            return {"message": "Missing value"}, 400
        color = Color(value=value)
        db.session.add(color)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return {"message": "Color already exists"}, 400
        return {"id": color.id, "value": color.value}, 201

    @bp.patch("/colors/<int:color_id>")
    @login_required
    def update_color(color_id):
        color = Color.query.get_or_404(color_id)
        data = request.get_json() or {}
        if "value" in data:
            color.value = data["value"]
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return {"message": "Color already exists"}, 400
        return {"id": color.id, "value": color.value}

    @bp.delete("/colors/<int:color_id>")
    @login_required
    def delete_color(color_id):
        color = Color.query.get_or_404(color_id)
        db.session.delete(color)
        db.session.commit()
        return {"message": "deleted"}

    @bp.post("/upload")
    @login_required
    def upload_file():
        if "file" not in request.files:
            return {"message": "No file"}, 400
        file = request.files["file"]
        if file.filename == "":
            return {"message": "No file"}, 400
        filename = secure_filename(file.filename)
        upload_dir = Path(current_app.config["UPLOAD_FOLDER"])
        upload_dir.mkdir(parents=True, exist_ok=True)
        target = upload_dir / filename
        if target.exists():
            stem = Path(filename).stem
            suffix = Path(filename).suffix
            i = 1
            while (upload_dir / f"{stem}_{i}{suffix}").exists():
                i += 1
            filename = f"{stem}_{i}{suffix}"
            target = upload_dir / filename
        file.save(target)
        return {"url": f"/api/uploads/{filename}"}


    @bp.route("/uploads/<path:filename>")
    def serve_upload(filename: str):
        upload_dir = Path(current_app.config["UPLOAD_FOLDER"])
        return send_from_directory(upload_dir, filename)

    return bp
