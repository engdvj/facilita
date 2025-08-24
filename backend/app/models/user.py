import json
from werkzeug.security import generate_password_hash, check_password_hash
from ..extensions import db
from .base import BaseModel


class User(BaseModel):
    __tablename__ = 'users'
    
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(512), nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    theme = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    last_login = db.Column(db.DateTime)
    
    # Relationships
    links = db.relationship("Link", back_populates="user", cascade="all, delete-orphan", lazy='dynamic')
    schedules = db.relationship("Schedule", back_populates="user", cascade="all, delete-orphan", lazy='dynamic')
    
    def set_password(self, password: str):
        """Hash and set user password."""
        if not password or len(password) < 6:
            raise ValueError("Password must be at least 6 characters long")
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Check if provided password matches user's password."""
        if not password:
            return False
        return check_password_hash(self.password_hash, password)
    
    def set_theme(self, theme_data: dict):
        """Set user theme configuration."""
        if theme_data:
            self.theme = json.dumps(theme_data)
        else:
            self.theme = None
    
    def get_theme(self) -> dict:
        """Get user theme configuration."""
        if self.theme:
            try:
                return json.loads(self.theme)
            except (json.JSONDecodeError, TypeError):
                return {}
        return {}
    
    def to_dict(self, include_sensitive=False, **kwargs):
        """Convert user to dictionary, excluding sensitive data by default."""
        data = {
            "id": self.id,
            "username": self.username,
            "isAdmin": self.is_admin,
            "isActive": self.is_active,
            "theme": self.get_theme(),
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
        
        if include_sensitive:
            data.update({
                "lastLogin": self.last_login.isoformat() if self.last_login else None,
                "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
            })
        
        return data
    
    @property
    def links_count(self):
        """Get count of user's links."""
        return self.links.count()
    
    @property
    def schedules_count(self):
        """Get count of user's schedules."""
        return self.schedules.count()
    
    def __repr__(self):
        return f"<User {self.username}>"