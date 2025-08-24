from flask import Blueprint, request, session, jsonify
from sqlalchemy.exc import IntegrityError
from ..extensions import db
from ..models import User, Category
from ..middleware.decorators import admin_required, get_current_user
from ..utils.validation import validate_required_fields, clean_payload

bp = Blueprint("categories", __name__)


@bp.get("/")
def list_categories():
    user_id = session.get("user_id")
    
    if user_id:
        user = User.query.get(user_id)
        if user.is_admin:
            categories = Category.query.all()
        else:
            categories = Category.query.filter_by(admin_only=False).all()
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


@bp.post("/")
@admin_required
def create_category():
    data = request.get_json() or {}
    
    is_valid, error_message = validate_required_fields(data, ["name"])
    if not is_valid:
        return {"message": error_message}, 400
    
    allowed_fields = ["name", "color", "icon", "admin_only"]
    category_data = clean_payload(data, allowed_fields)
    category_data.setdefault("admin_only", False)
    
    category = Category(**category_data)
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


@bp.patch("/<int:cat_id>")
@admin_required
def update_category(cat_id):
    category = Category.query.get_or_404(cat_id)
    data = request.get_json() or {}
    
    allowed_fields = ["name", "color", "icon", "admin_only"]
    for field in allowed_fields:
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


@bp.delete("/<int:cat_id>")
@admin_required
def delete_category(cat_id):
    category = Category.query.get_or_404(cat_id)
    db.session.delete(category)
    db.session.commit()
    return {"message": "deleted"}