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


def admin_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        user_id = session.get("user_id")
        if not user_id:
            return {"message": "Unauthorized"}, 401
        user = User.query.get(user_id)
        if not user or not user.is_admin:
            return {"message": "Forbidden"}, 403
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

    @bp.post("/auth/register")
    def register():
        data = request.get_json() or {}
        username = data.get("username")
        password = data.get("password")
        if not username or not password:
            return {"message": "Missing credentials"}, 400
        if User.query.filter_by(username=username).first():
            return {"message": "User exists"}, 400
        user = User(username=username)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return {"message": "created"}, 201

    @bp.get("/auth/me")
    @login_required
    def auth_me():
        user = User.query.get(session["user_id"])
        return {
            "id": user.id,
            "username": user.username,
            "isAdmin": user.is_admin,
        }

    @bp.post("/auth/change-password")
    @login_required
    def change_password():
        data = request.get_json() or {}
        old = data.get("old_password")
        new = data.get("new_password")
        if not old or not new:
            return {"message": "Missing data"}, 400
        user = User.query.get(session["user_id"])
        if not user.check_password(old):
            return {"message": "Invalid password"}, 400
        user.set_password(new)
        db.session.commit()
        return {"message": "ok"}

    @bp.post("/auth/logout")
    def logout():
        session.pop("user_id", None)
        return {"message": "ok"}

    @bp.get("/links")
    def list_links():
        user_id = session.get("user_id")
        if not user_id:
            links = (
                Link.query.join(Category, isouter=True)
                .filter(
                    ((Category.admin_only == False) | (Link.category == None))
                    & (Link.user_id == None)
                )
                .all()
            )
            include_user = False
        else:
            user = User.query.get(user_id)
            if user.is_admin:
                links = Link.query.all()
                include_user = True
            else:
                links = (
                    Link.query.join(Category, isouter=True)
                    .filter(
                        (Link.user_id == user_id)
                        | (
                            (Link.user_id == None)
                            & ((Category.admin_only == False) | (Link.category == None))
                        )
                    )
                    .all()
                )
                include_user = False
        return jsonify([l.to_dict(include_user=include_user) for l in links])

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
            user_id=session["user_id"],
            category_id=data.get("category_id"),
            color=data.get("color"),
            image_url=data.get("image_url"),
        )
        db.session.add(link)
        db.session.commit()
        return link.to_dict(include_user=True), 201

    @bp.patch("/links/<int:link_id>")
    @login_required
    def update_link(link_id):
        link = Link.query.get_or_404(link_id)
        user = User.query.get(session["user_id"])
        if not user.is_admin and link.user_id != user.id:
            return {"message": "Forbidden"}, 403
        data = request.get_json() or {}
        for field in ["title", "url", "category_id", "color", "image_url"]:
            if field in data:
                setattr(link, field, data[field])
        db.session.commit()
        return link.to_dict(include_user=True)

    @bp.delete("/links/<int:link_id>")
    @login_required
    def delete_link(link_id):
        link = Link.query.get_or_404(link_id)
        user = User.query.get(session["user_id"])
        if not user.is_admin and link.user_id != user.id:
            return {"message": "Forbidden"}, 403
        db.session.delete(link)
        db.session.commit()
        return {"message": "deleted"}

    @bp.get("/categories")
    def list_categories():
        if session.get("user_id"):
            categories = Category.query.all()
        else:
            categories = Category.query.filter_by(admin_only=False).all()
        return jsonify([
            {
                "id": c.id,
                "name": c.name,
                "color": c.color,
                "icon": c.icon,
                "adminOnly": c.admin_only,
            }
            for c in categories
        ])

    @bp.post("/categories")
    @admin_required
    def create_category():
        data = request.get_json() or {}
        name = data.get("name")
        if not name:
            return {"message": "Missing name"}, 400
        category = Category(
            name=name,
            color=data.get("color"),
            icon=data.get("icon"),
            admin_only=data.get("admin_only", False),
        )
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
            "adminOnly": category.admin_only,
        }, 201

    @bp.patch("/categories/<int:cat_id>")
    @admin_required
    def update_category(cat_id):
        category = Category.query.get_or_404(cat_id)
        data = request.get_json() or {}
        for field in ["name", "color", "icon", "admin_only"]:
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
            "adminOnly": category.admin_only,
        }

    @bp.delete("/categories/<int:cat_id>")
    @admin_required
    def delete_category(cat_id):
        category = Category.query.get_or_404(cat_id)
        db.session.delete(category)
        db.session.commit()
        return {"message": "deleted"}

    @bp.get("/colors")
    def list_colors():
        colors = Color.query.all()
        return jsonify([

            {"id": c.id, "value": c.value, "name": c.name}
            for c in colors

        ])

    @bp.post("/colors")
    @admin_required
    def create_color():
        data = request.get_json() or {}
        value = data.get("value")
        if not value:
            return {"message": "Missing value"}, 400

        color = Color(value=value, name=data.get("name"))

        db.session.add(color)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return {"message": "Color already exists"}, 400
        return {
            "id": color.id,
            "value": color.value,
            "name": color.name,

        }, 201

    @bp.patch("/colors/<int:color_id>")
    @admin_required
    def update_color(color_id):
        color = Color.query.get_or_404(color_id)
        data = request.get_json() or {}
        if "value" in data:
            color.value = data["value"]
        if "name" in data:
            color.name = data["name"]

        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return {"message": "Color already exists"}, 400
        return {
            "id": color.id,
            "value": color.value,
            "name": color.name,

        }

    @bp.delete("/colors/<int:color_id>")
    @admin_required
    def delete_color(color_id):
        color = Color.query.get_or_404(color_id)
        db.session.delete(color)
        db.session.commit()
        return {"message": "deleted"}

    @bp.get("/users")
    @login_required
    def list_users():
        current = User.query.get(session["user_id"])
        if not current.is_admin:
            return {"message": "Forbidden"}, 403
        users = User.query.all()
        return jsonify(
            [
                {"id": u.id, "username": u.username, "isAdmin": u.is_admin}
                for u in users
            ]
        )

    @bp.post("/users")
    @login_required
    def create_user():
        current = User.query.get(session["user_id"])
        if not current.is_admin:
            return {"message": "Forbidden"}, 403
        data = request.get_json() or {}
        username = data.get("username")
        password = data.get("password")
        if not username or not password:
            return {"message": "Missing data"}, 400
        if User.query.filter_by(username=username).first():
            return {"message": "User exists"}, 400
        user = User(username=username, is_admin=data.get("is_admin", False))
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return {
            "id": user.id,
            "username": user.username,
            "isAdmin": user.is_admin,
        }, 201

    @bp.patch("/users/<int:user_id>")
    @login_required
    def update_user(user_id):
        current = User.query.get(session["user_id"])
        if not current.is_admin:
            return {"message": "Forbidden"}, 403
        user = User.query.get_or_404(user_id)
        data = request.get_json() or {}
        if "username" in data:
            user.username = data["username"]
        if "password" in data:
            user.set_password(data["password"])
        if "is_admin" in data:
            user.is_admin = data["is_admin"]
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return {"message": "User exists"}, 400
        return {
            "id": user.id,
            "username": user.username,
            "isAdmin": user.is_admin,
        }

    @bp.delete("/users/<int:user_id>")
    @login_required
    def delete_user(user_id):
        current = User.query.get(session["user_id"])
        if not current.is_admin:
            return {"message": "Forbidden"}, 403
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
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
