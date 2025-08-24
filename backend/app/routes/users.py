from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError

from ..extensions import db
from ..models import User
from ..schemas import UserCreate, UserUpdate, UserResponse, UserListResponse
from ..middleware.decorators import admin_required, login_required, get_current_user

bp = Blueprint("users", __name__)


@bp.get("/")
@admin_required
def list_users():
    """Get list of all users (admin only)."""
    try:
        users = User.query.order_by(User.username).all()
        return jsonify([
            UserListResponse.model_validate(user).model_dump()
            for user in users
        ])
    except Exception as e:
        return {"message": f"Error fetching users: {str(e)}"}, 500


@bp.post("/")
@admin_required
def create_user():
    """Create a new user (admin only)."""
    try:
        # Validate request data
        data = request.get_json() or {}
        user_data = UserCreate.model_validate(data)
        
        # Check if user already exists
        if User.query.filter_by(username=user_data.username).first():
            return {"message": "User already exists"}, 400
        
        # Create new user
        user = User(
            username=user_data.username,
            is_admin=user_data.is_admin
        )
        user.set_password(user_data.password)
        
        db.session.add(user)
        db.session.commit()
        
        return UserResponse.model_validate(user).model_dump(), 201
        
    except ValidationError as e:
        return {"message": "Validation error", "errors": e.errors()}, 400
    except IntegrityError:
        db.session.rollback()
        return {"message": "User already exists"}, 400
    except Exception as e:
        db.session.rollback()
        return {"message": f"Error creating user: {str(e)}"}, 500


@bp.get("/<int:user_id>")
@admin_required
def get_user(user_id):
    """Get specific user details (admin only)."""
    try:
        user = User.query.get_or_404(user_id)
        return UserResponse.model_validate(user).model_dump()
    except Exception as e:
        return {"message": f"Error fetching user: {str(e)}"}, 500


@bp.patch("/<int:user_id>")
@admin_required
def update_user(user_id):
    """Update user data (admin only)."""
    try:
        user = User.query.get_or_404(user_id)
        
        # Validate request data
        data = request.get_json() or {}
        user_data = UserUpdate.model_validate(data)
        
        # Update user fields
        update_dict = user_data.model_dump(exclude_unset=True)
        
        if 'password' in update_dict:
            user.set_password(update_dict.pop('password'))
        
        if 'theme' in update_dict:
            user.set_theme(update_dict.pop('theme'))
        
        for field, value in update_dict.items():
            setattr(user, field, value)
        
        db.session.commit()
        
        return UserResponse.model_validate(user).model_dump()
        
    except ValidationError as e:
        return {"message": "Validation error", "errors": e.errors()}, 400
    except IntegrityError:
        db.session.rollback()
        return {"message": "Username already exists"}, 400
    except Exception as e:
        db.session.rollback()
        return {"message": f"Error updating user: {str(e)}"}, 500


@bp.delete("/<int:user_id>")
@admin_required
def delete_user(user_id):
    """Delete user (admin only)."""
    try:
        user = User.query.get_or_404(user_id)
        
        # Prevent admin from deleting themselves
        current_user = get_current_user()
        if user.id == current_user.id:
            return {"message": "Cannot delete your own account"}, 400
        
        db.session.delete(user)
        db.session.commit()
        
        return {"message": "User deleted successfully"}
        
    except Exception as e:
        db.session.rollback()
        return {"message": f"Error deleting user: {str(e)}"}, 500


@bp.get("/profile")
@login_required
def get_profile():
    """Get current user's profile."""
    try:
        user = get_current_user()
        return UserResponse.model_validate(user).model_dump()
    except Exception as e:
        return {"message": f"Error fetching profile: {str(e)}"}, 500


@bp.patch("/profile")
@login_required
def update_profile():
    """Update current user's profile."""
    try:
        user = get_current_user()
        
        # Validate request data (limited fields for regular users)
        data = request.get_json() or {}
        allowed_fields = {'username', 'theme'}
        
        # Filter out fields that regular users can't change
        if not user.is_admin:
            data = {k: v for k, v in data.items() if k in allowed_fields}
        
        user_data = UserUpdate.model_validate(data)
        
        # Update user fields
        update_dict = user_data.model_dump(exclude_unset=True)
        
        if 'theme' in update_dict:
            user.set_theme(update_dict.pop('theme'))
        
        for field, value in update_dict.items():
            setattr(user, field, value)
        
        db.session.commit()
        
        return UserResponse.model_validate(user).model_dump()
        
    except ValidationError as e:
        return {"message": "Validation error", "errors": e.errors()}, 400
    except IntegrityError:
        db.session.rollback()
        return {"message": "Username already exists"}, 400
    except Exception as e:
        db.session.rollback()
        return {"message": f"Error updating profile: {str(e)}"}, 500