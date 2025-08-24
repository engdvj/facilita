from flask import Blueprint, request, session
import json
from ..extensions import db
from ..models import User
from ..middleware.decorators import login_required
from ..utils.validation import validate_required_fields

bp = Blueprint("auth", __name__)


@bp.post("/login")
def login():
    data = request.get_json() or {}
    is_valid, error_message = validate_required_fields(data, ["username", "password"])
    
    if not is_valid:
        return {"message": error_message}, 400
    
    username = data["username"]
    password = data["password"]
    
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        session["user_id"] = user.id
        return {"message": "ok"}
    
    return {"message": "Invalid credentials"}, 401


@bp.post("/register")
def register():
    data = request.get_json() or {}
    is_valid, error_message = validate_required_fields(data, ["username", "password"])
    
    if not is_valid:
        return {"message": error_message}, 400
    
    username = data["username"]
    password = data["password"]
    
    if User.query.filter_by(username=username).first():
        return {"message": "User exists"}, 400
    
    user = User(username=username)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    
    return {"message": "created"}, 201


@bp.get("/me")
@login_required
def auth_me():
    user = User.query.get(session["user_id"])
    data = {
        "id": user.id,
        "username": user.username,
        "isAdmin": user.is_admin,
    }
    
    if user.theme:
        try:
            data["theme"] = json.loads(user.theme)
        except Exception:
            data["theme"] = None
    else:
        data["theme"] = None
    
    return data


@bp.post("/change-password")
@login_required
def change_password():
    data = request.get_json() or {}
    is_valid, error_message = validate_required_fields(data, ["old_password", "new_password"])
    
    if not is_valid:
        return {"message": error_message}, 400
    
    old_password = data["old_password"]
    new_password = data["new_password"]
    
    user = User.query.get(session["user_id"])
    if not user.check_password(old_password):
        return {"message": "Invalid password"}, 400
    
    user.set_password(new_password)
    db.session.commit()
    
    return {"message": "ok"}


@bp.post("/logout")
def logout():
    session.pop("user_id", None)
    return {"message": "ok"}