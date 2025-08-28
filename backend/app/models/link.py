from ..extensions import db
from .base import BaseModel


class Link(BaseModel):
    __tablename__ = 'links'
    
    title = db.Column(db.String(200), nullable=False, index=True)
    url = db.Column(db.String(2048))  # URLs can be long
    description = db.Column(db.Text)
    color = db.Column(db.String(30))
    image_url = db.Column(db.String(2048))
    file_url = db.Column(db.String(2048))
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    is_public = db.Column(db.Boolean, default=False, nullable=False)
    is_favorite = db.Column(db.Boolean, default=False, nullable=False)
    click_count = db.Column(db.Integer, default=0)
    sort_order = db.Column(db.Integer, default=0)
    
    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), index=True)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), index=True)
    
    # Relationships
    user = db.relationship("User", back_populates="links")
    category = db.relationship("Category", back_populates="links")
    
    def to_dict(self, include_user=False, include_stats=False, **kwargs):
        """Convert link to dictionary."""
        data = {
            "id": self.id,
            "title": self.title,
            "url": self.url,
            "description": self.description,
            "color": self.color,
            "imageUrl": self.image_url,
            "fileUrl": self.file_url,
            "isActive": self.is_active,
            "isPublic": self.is_public,
            "isFavorite": self.is_favorite,
            "sortOrder": self.sort_order,
            "userId": self.user_id,
            "categoryId": self.category_id,
            "category": self.category.name if self.category else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
        
        if include_user and self.user:
            data["user"] = self.user.username
        
        if include_stats:
            data["clickCount"] = self.click_count
        
        return data
    
    def increment_clicks(self):
        """Increment click counter for this link."""
        self.click_count += 1
        db.session.commit()
    
    @property
    def has_file(self):
        """Check if link has an associated file."""
        return bool(self.file_url)
    
    @property
    def has_image(self):
        """Check if link has an associated image."""
        return bool(self.image_url)
    
    @classmethod
    def get_public_links(cls):
        """Get all public links (no user assigned)."""
        return cls.query.filter_by(user_id=None, is_active=True).order_by(cls.sort_order, cls.title)
    
    @classmethod
    def get_user_links(cls, user_id):
        """Get all links for a specific user."""
        return cls.query.filter_by(user_id=user_id, is_active=True).order_by(cls.sort_order, cls.title)
    
    @classmethod
    def get_category_links(cls, category_id):
        """Get all links in a specific category."""
        return cls.query.filter_by(category_id=category_id, is_active=True).order_by(cls.sort_order, cls.title)
    
    def validate(self):
        """Validate link data."""
        if not self.title:
            raise ValueError("Title is required")
        
        if not self.url and not self.file_url:
            raise ValueError("Either URL or file URL is required")
        
        if self.url and len(self.url) > 2048:
            raise ValueError("URL is too long")
        
        if self.title and len(self.title) > 200:
            raise ValueError("Title is too long")
    
    def __repr__(self):
        return f"<Link {self.title}>"