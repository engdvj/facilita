"""User service for authentication and user management."""

from typing import Optional, Dict, Any
from datetime import datetime

from ..models import User
from ..extensions import db
from .base import BaseService


class UserService(BaseService[User]):
    """Service for user-related operations."""
    
    def __init__(self):
        super().__init__(User)
    
    def get_filtered(self, filters: dict):
        """Get filtered users."""
        query = self.model_class.query
        
        if filters.get('is_admin') is not None:
            query = query.filter_by(is_admin=filters['is_admin'])
        
        if filters.get('is_active') is not None:
            query = query.filter_by(is_active=filters['is_active'])
        
        if filters.get('search'):
            search_term = f"%{filters['search']}%"
            query = query.filter(User.username.ilike(search_term))
        
        return query.order_by(User.username).all()
    
    def authenticate(self, username: str, password: str) -> Optional[User]:
        """Authenticate user with username and password."""
        if not username or not password:
            return None
        
        user = User.query.filter_by(username=username.lower(), is_active=True).first()
        
        if user and user.check_password(password):
            # Update last login
            user.last_login = datetime.utcnow()
            db.session.commit()
            return user
        
        return None
    
    def create_user(self, username: str, password: str, is_admin: bool = False) -> User:
        """Create a new user."""
        # Check if user already exists
        if User.query.filter_by(username=username.lower()).first():
            raise ValueError("Username already exists")
        
        # Create user
        user = User(
            username=username.lower(),
            is_admin=is_admin
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        return user
    
    def update_password(self, user_id: int, old_password: str, new_password: str) -> User:
        """Update user password after verifying old password."""
        user = self.get_by_id_or_404(user_id)
        
        if not user.check_password(old_password):
            raise ValueError("Current password is incorrect")
        
        user.set_password(new_password)
        db.session.commit()
        
        return user
    
    def update_theme(self, user_id: int, theme_data: Dict[str, Any]) -> User:
        """Update user theme configuration."""
        user = self.get_by_id_or_404(user_id)
        user.set_theme(theme_data)
        db.session.commit()
        return user
    
    def get_or_create_admin_user(self, username: str = "admin", password: str = "admin123") -> User:
        """Get existing admin user or create new one."""
        admin = User.query.filter_by(username=username).first()
        
        if not admin:
            admin = User(username=username, is_admin=True)
            db.session.add(admin)
        
        # Always update password and ensure admin privileges
        admin.set_password(password)
        admin.is_admin = True
        admin.is_active = True
        
        db.session.commit()
        return admin
    
    def toggle_admin_status(self, user_id: int, current_user_id: int) -> User:
        """Toggle user admin status (only by other admins)."""
        if user_id == current_user_id:
            raise ValueError("Cannot change your own admin status")
        
        user = self.get_by_id_or_404(user_id)
        user.is_admin = not user.is_admin
        db.session.commit()
        
        return user
    
    def toggle_active_status(self, user_id: int, current_user_id: int) -> User:
        """Toggle user active status (only by admins)."""
        if user_id == current_user_id:
            raise ValueError("Cannot deactivate your own account")
        
        user = self.get_by_id_or_404(user_id)
        user.is_active = not user.is_active
        db.session.commit()
        
        return user
    
    def get_user_stats(self) -> dict:
        """Get user statistics."""
        total_users = self.count(active_only=False)
        active_users = self.count(active_only=True)
        admin_users = User.query.filter_by(is_admin=True, is_active=True).count()
        
        # Get users with recent activity (last 30 days)
        from datetime import timedelta
        recent_threshold = datetime.utcnow() - timedelta(days=30)
        recent_users = User.query.filter(
            User.last_login >= recent_threshold,
            User.is_active == True
        ).count()
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "admin_users": admin_users,
            "recent_active_users": recent_users
        }
    
    def search_users(self, query: str, limit: int = 10):
        """Search users by username."""
        search_term = f"%{query}%"
        return (
            User.query
            .filter(
                User.username.ilike(search_term),
                User.is_active == True
            )
            .limit(limit)
            .all()
        )