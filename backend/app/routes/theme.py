from flask import Blueprint, request, session
import json
from ..extensions import db
from ..models import User
from ..middleware.decorators import login_required

bp = Blueprint("theme", __name__)


@bp.get("/")
def get_theme():
    """Get theme configuration for current user or default admin theme."""
    user_id = session.get("user_id")
    
    if user_id:
        user = User.query.get(user_id)
    else:
        # Get default theme from admin user
        user = User.query.filter_by(is_admin=True).first()
    
    if user and user.theme:
        try:
            return {"theme": json.loads(user.theme)}
        except Exception:
            return {"theme": None}
    
    return {"theme": None}


@bp.post("/")
@login_required
def set_theme():
    """Set theme configuration for current user."""
    user = User.query.get(session["user_id"])
    data = request.get_json() or {}
    theme = data.get("theme")
    
    if theme is not None:
        user.theme = json.dumps(theme)
    else:
        user.theme = None
    
    db.session.commit()
    return {"message": "ok"}