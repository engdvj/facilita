import re
from ..extensions import db
from .base import BaseModel


class Color(BaseModel):
    __tablename__ = 'colors'
    
    name = db.Column(db.String(50))
    value = db.Column(db.String(30), unique=True, nullable=False, index=True)
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    sort_order = db.Column(db.Integer, default=0)
    
    def to_dict(self, **kwargs):
        """Convert color to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "value": self.value,
            "description": self.description,
            "isActive": self.is_active,
            "sortOrder": self.sort_order,
        }
    
    @staticmethod
    def is_valid_color(color_value):
        """Validate if color value is a valid hex color."""
        if not color_value:
            return False
        
        # Check for valid hex color pattern
        hex_pattern = r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
        return bool(re.match(hex_pattern, color_value))
    
    @classmethod
    def get_active_colors(cls):
        """Get all active colors ordered by sort order."""
        return cls.query.filter_by(is_active=True).order_by(cls.sort_order, cls.name)
    
    def validate(self):
        """Validate color data."""
        if not self.value:
            raise ValueError("Color value is required")
        
        if not self.is_valid_color(self.value):
            raise ValueError("Invalid color format. Use hex format like #FF0000")
        
        if self.name and len(self.name) > 50:
            raise ValueError("Color name is too long")
    
    def __repr__(self):
        return f"<Color {self.name or self.value}>"