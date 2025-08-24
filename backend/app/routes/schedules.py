from flask import Blueprint, request, jsonify, session
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError

from ..extensions import db
from ..models import User, Schedule, Category
from ..middleware.decorators import login_required, get_current_user
from ..utils.validation import validate_required_fields, clean_payload, handle_nullable_fields

bp = Blueprint("schedules", __name__)


@bp.get("/")
@login_required
def list_schedules():
    """Get list of schedules based on user permissions."""
    try:
        user = get_current_user()
        
        if user.is_admin:
            # Admins see all schedules
            schedules = Schedule.query.order_by(Schedule.sort_order, Schedule.title).all()
        else:
            # Regular users see public schedules + their own
            schedules = (
                Schedule.query
                .filter(
                    (Schedule.user_id == user.id) | (Schedule.user_id == None)
                )
                .filter_by(is_active=True)
                .order_by(Schedule.sort_order, Schedule.title)
                .all()
            )
        
        return jsonify([
            schedule.to_dict(include_user=user.is_admin)
            for schedule in schedules
        ])
        
    except Exception as e:
        return {"message": f"Error fetching schedules: {str(e)}"}, 500


@bp.post("/")
@login_required
def create_schedule():
    """Create a new schedule."""
    try:
        data = request.get_json() or {}
        
        # Validate required fields
        is_valid, error_message = validate_required_fields(data, ["title", "file_url"])
        if not is_valid:
            return {"message": error_message}, 400
        
        current_user = get_current_user()
        
        # Determine schedule owner
        owner_id = current_user.id
        if current_user.is_admin and "user_id" in data:
            owner_id = data.get("user_id")
        
        # Clean and prepare data
        allowed_fields = ["title", "file_url", "description", "category_id", "sort_order"]
        if current_user.is_admin:
            allowed_fields.extend(["user_id", "file_size", "file_type"])
        
        schedule_data = clean_payload(data, allowed_fields)
        schedule_data["user_id"] = owner_id
        
        # Handle nullable fields
        schedule_data = handle_nullable_fields(schedule_data, ["category_id"])
        
        # Create schedule
        schedule = Schedule(**schedule_data)
        
        # Validate schedule
        try:
            schedule.validate()
        except ValueError as e:
            return {"message": str(e)}, 400
        
        db.session.add(schedule)
        db.session.commit()
        
        return schedule.to_dict(include_user=True), 201
        
    except Exception as e:
        db.session.rollback()
        return {"message": f"Error creating schedule: {str(e)}"}, 500


@bp.get("/<int:schedule_id>")
@login_required
def get_schedule(schedule_id):
    """Get specific schedule details."""
    try:
        schedule = Schedule.query.get_or_404(schedule_id)
        user = get_current_user()
        
        # Check permissions
        if not user.is_admin and schedule.user_id != user.id and schedule.user_id is not None:
            return {"message": "Permission denied"}, 403
        
        return schedule.to_dict(include_user=user.is_admin, include_stats=True)
        
    except Exception as e:
        return {"message": f"Error fetching schedule: {str(e)}"}, 500


@bp.patch("/<int:schedule_id>")
@login_required
def update_schedule(schedule_id):
    """Update schedule data."""
    try:
        schedule = Schedule.query.get_or_404(schedule_id)
        user = get_current_user()
        
        # Check permissions
        if not user.is_admin and schedule.user_id != user.id:
            return {"message": "Permission denied"}, 403
        
        data = request.get_json() or {}
        
        # Define allowed fields based on user role
        allowed_fields = ["title", "file_url", "description", "category_id", "sort_order"]
        if user.is_admin:
            allowed_fields.extend(["user_id", "is_active", "file_size", "file_type"])
        
        # Update schedule fields
        for field in allowed_fields:
            if field in data:
                setattr(schedule, field, data[field])
        
        # Handle nullable fields
        if schedule.category_id is None:
            schedule.category_id = None
        
        # Validate updated schedule
        try:
            schedule.validate()
        except ValueError as e:
            return {"message": str(e)}, 400
        
        db.session.commit()
        
        return schedule.to_dict(include_user=True)
        
    except Exception as e:
        db.session.rollback()
        return {"message": f"Error updating schedule: {str(e)}"}, 500


@bp.delete("/<int:schedule_id>")
@login_required
def delete_schedule(schedule_id):
    """Delete schedule."""
    try:
        schedule = Schedule.query.get_or_404(schedule_id)
        user = get_current_user()
        
        # Check permissions
        if not user.is_admin and schedule.user_id != user.id:
            return {"message": "Permission denied"}, 403
        
        db.session.delete(schedule)
        db.session.commit()
        
        return {"message": "Schedule deleted successfully"}
        
    except Exception as e:
        db.session.rollback()
        return {"message": f"Error deleting schedule: {str(e)}"}, 500


@bp.post("/<int:schedule_id>/download")
@login_required
def track_download(schedule_id):
    """Track download of a schedule file."""
    try:
        schedule = Schedule.query.get_or_404(schedule_id)
        user = get_current_user()
        
        # Check permissions
        if not user.is_admin and schedule.user_id != user.id and schedule.user_id is not None:
            return {"message": "Permission denied"}, 403
        
        schedule.increment_downloads()
        
        return {
            "message": "Download tracked",
            "download_count": schedule.download_count
        }
        
    except Exception as e:
        return {"message": f"Error tracking download: {str(e)}"}, 500


@bp.get("/stats")
@login_required
def get_schedule_stats():
    """Get schedule statistics (admin only)."""
    try:
        user = get_current_user()
        
        if not user.is_admin:
            return {"message": "Permission denied"}, 403
        
        total_schedules = Schedule.query.count()
        active_schedules = Schedule.query.filter_by(is_active=True).count()
        public_schedules = Schedule.query.filter_by(user_id=None, is_active=True).count()
        user_schedules = Schedule.query.filter(Schedule.user_id.isnot(None)).count()
        
        total_downloads = db.session.query(
            db.func.sum(Schedule.download_count)
        ).scalar() or 0
        
        return {
            "total_schedules": total_schedules,
            "active_schedules": active_schedules,
            "public_schedules": public_schedules,
            "user_schedules": user_schedules,
            "total_downloads": total_downloads
        }
        
    except Exception as e:
        return {"message": f"Error fetching schedule stats: {str(e)}"}, 500