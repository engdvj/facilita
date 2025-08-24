from ..extensions import db
from .base import BaseModel


class Schedule(BaseModel):
    __tablename__ = 'schedules'
    
    title = db.Column(db.String(200), nullable=False, index=True)
    file_url = db.Column(db.String(2048), nullable=False)
    description = db.Column(db.Text)
    file_size = db.Column(db.Integer)  # Size in bytes
    file_type = db.Column(db.String(100))  # MIME type
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    download_count = db.Column(db.Integer, default=0)
    sort_order = db.Column(db.Integer, default=0)
    
    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), index=True)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), index=True)
    
    # Relationships
    user = db.relationship("User", back_populates="schedules")
    category = db.relationship("Category", back_populates="schedules")
    
    def to_dict(self, include_user=False, include_stats=False, **kwargs):
        """Convert schedule to dictionary."""
        data = {
            "id": self.id,
            "title": self.title,
            "fileUrl": self.file_url,
            "description": self.description,
            "fileSize": self.file_size,
            "fileType": self.file_type,
            "isActive": self.is_active,
            "sortOrder": self.sort_order,
            "userId": self.user_id,
            "categoryId": self.category_id,
            "category": self.category.name if self.category else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
        
        if include_user and self.user:
            data["user"] = self.user.username
            
        if include_stats:
            data["downloadCount"] = self.download_count
        
        return data
    
    def increment_downloads(self):
        """Increment download counter for this schedule."""
        self.download_count += 1
        db.session.commit()
    
    @property
    def file_size_formatted(self):
        """Get formatted file size."""
        if not self.file_size:
            return "Unknown"
        
        for unit in ['B', 'KB', 'MB', 'GB']:
            if self.file_size < 1024.0:
                return f"{self.file_size:.1f} {unit}"
            self.file_size /= 1024.0
        return f"{self.file_size:.1f} TB"
    
    @classmethod
    def get_public_schedules(cls):
        """Get all public schedules (no user assigned)."""
        return cls.query.filter_by(user_id=None, is_active=True).order_by(cls.sort_order, cls.title)
    
    @classmethod
    def get_user_schedules(cls, user_id):
        """Get all schedules for a specific user."""
        return cls.query.filter_by(user_id=user_id, is_active=True).order_by(cls.sort_order, cls.title)
    
    def validate(self):
        """Validate schedule data."""
        if not self.title:
            raise ValueError("Title is required")
        
        if not self.file_url:
            raise ValueError("File URL is required")
        
        if self.title and len(self.title) > 200:
            raise ValueError("Title is too long")
    
    def __repr__(self):
        return f"<Schedule {self.title}>"