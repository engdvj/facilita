from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError

from ..extensions import db
from ..models import Color
from ..middleware.decorators import admin_required
from ..utils.validation import validate_required_fields

bp = Blueprint("colors", __name__)


@bp.get("/")
def list_colors():
    """Get list of all active colors."""
    try:
        colors = Color.get_active_colors().all()
        return jsonify([color.to_dict() for color in colors])
    except Exception as e:
        return {"message": f"Error fetching colors: {str(e)}"}, 500


@bp.post("/")
@admin_required
def create_color():
    """Create a new color (admin only)."""
    try:
        data = request.get_json() or {}
        
        # Validate required fields
        is_valid, error_message = validate_required_fields(data, ["value"])
        if not is_valid:
            return {"message": error_message}, 400
        
        # Create color instance for validation
        color = Color(
            value=data["value"],
            name=data.get("name"),
            description=data.get("description"),
            sort_order=data.get("sort_order", 0)
        )
        
        # Validate color
        try:
            color.validate()
        except ValueError as e:
            return {"message": str(e)}, 400
        
        # Save to database
        db.session.add(color)
        db.session.commit()
        
        return color.to_dict(), 201
        
    except IntegrityError:
        db.session.rollback()
        return {"message": "Color already exists"}, 400
    except Exception as e:
        db.session.rollback()
        return {"message": f"Error creating color: {str(e)}"}, 500


@bp.get("/<int:color_id>")
def get_color(color_id):
    """Get specific color details."""
    try:
        color = Color.query.get_or_404(color_id)
        return color.to_dict()
    except Exception as e:
        return {"message": f"Error fetching color: {str(e)}"}, 500


@bp.patch("/<int:color_id>")
@admin_required
def update_color(color_id):
    """Update color data (admin only)."""
    try:
        color = Color.query.get_or_404(color_id)
        data = request.get_json() or {}
        
        # Update fields
        allowed_fields = ["name", "value", "description", "is_active", "sort_order"]
        for field in allowed_fields:
            if field in data:
                setattr(color, field, data[field])
        
        # Validate updated color
        try:
            color.validate()
        except ValueError as e:
            return {"message": str(e)}, 400
        
        db.session.commit()
        
        return color.to_dict()
        
    except IntegrityError:
        db.session.rollback()
        return {"message": "Color value already exists"}, 400
    except Exception as e:
        db.session.rollback()
        return {"message": f"Error updating color: {str(e)}"}, 500


@bp.delete("/<int:color_id>")
@admin_required
def delete_color(color_id):
    """Delete color (admin only)."""
    try:
        color = Color.query.get_or_404(color_id)
        db.session.delete(color)
        db.session.commit()
        
        return {"message": "Color deleted successfully"}
        
    except Exception as e:
        db.session.rollback()
        return {"message": f"Error deleting color: {str(e)}"}, 500


@bp.get("/palette")
def get_color_palette():
    """Get color palette organized by categories."""
    try:
        colors = Color.get_active_colors().all()
        
        # Group colors by category (you can customize this logic)
        palette = {
            "primary": [],
            "secondary": [],
            "neutral": [],
            "custom": []
        }
        
        for color in colors:
            # Simple categorization based on color name or value
            name_lower = (color.name or "").lower()
            value = color.value.upper()
            
            if any(term in name_lower for term in ["primary", "main", "blue"]):
                palette["primary"].append(color.to_dict())
            elif any(term in name_lower for term in ["secondary", "accent", "green"]):
                palette["secondary"].append(color.to_dict())
            elif any(term in name_lower for term in ["gray", "grey", "black", "white"]):
                palette["neutral"].append(color.to_dict())
            else:
                palette["custom"].append(color.to_dict())
        
        return palette
        
    except Exception as e:
        return {"message": f"Error fetching color palette: {str(e)}"}, 500


@bp.post("/validate")
def validate_color():
    """Validate a color value."""
    try:
        data = request.get_json() or {}
        value = data.get("value")
        
        if not value:
            return {"valid": False, "message": "Color value is required"}
        
        is_valid = Color.is_valid_color(value)
        
        return {
            "valid": is_valid,
            "message": "Valid color" if is_valid else "Invalid color format. Use hex format like #FF0000",
            "value": value
        }
        
    except Exception as e:
        return {"message": f"Error validating color: {str(e)}"}, 500