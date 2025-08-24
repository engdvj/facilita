from functools import wraps
from flask import session, jsonify
from ..models import User


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


def get_current_user():
    user_id = session.get("user_id")
    if not user_id:
        return None
    return User.query.get(user_id)