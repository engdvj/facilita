from ..extensions import db
from .base import BaseModel


class Category(BaseModel):
    __tablename__ = 'categories'
    
    name = db.Column(db.String(80), unique=True, nullable=False, index=True)
    color = db.Column(db.String(30))
    icon = db.Column(db.String(50))
    admin_only = db.Column(db.Boolean, default=False, nullable=False)
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    sort_order = db.Column(db.Integer, default=0)
    
    # Relationships
    links = db.relationship("Link", back_populates="category", lazy='dynamic')
    schedules = db.relationship("Schedule", back_populates="category", lazy='dynamic')
    
    def to_dict(self, include_stats=False, **kwargs):
        """Convert category to dictionary."""
        data = {
            "id": self.id,
            "name": self.name,
            "color": self.color,
            "icon": self.icon,
            "adminOnly": self.admin_only,
            "description": self.description,
            "isActive": self.is_active,
            "sortOrder": self.sort_order,
        }
        
        if include_stats:
            data.update({
                "linksCount": self.links_count,
                "schedulesCount": self.schedules_count,
            })
        
        return data
    
    @property
    def links_count(self):
        """Get count of links in this category."""
        return self.links.count()
    
    @property
    def schedules_count(self):
        """Get count of schedules in this category."""
        return self.schedules.count()
    
    @classmethod
    def get_public_categories(cls):
        """Get all public (non-admin-only) categories."""
        return cls.query.filter_by(admin_only=False, is_active=True).order_by(cls.sort_order, cls.name)
    
    @classmethod
    def get_admin_categories(cls):
        """Get all categories for admin users."""
        return cls.query.filter_by(is_active=True).order_by(cls.sort_order, cls.name)
    
    def __repr__(self):
        return f"<Category {self.name}>"