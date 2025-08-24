from .extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from typing import Dict, Any, Optional
import re


class BaseModel(db.Model):
    """Base model with common fields and methods"""
    __abstract__ = True
    
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def to_dict(self, include_timestamps: bool = True) -> Dict[str, Any]:
        """Convert model to dictionary"""
        data = {}
        for column in self.__table__.columns:
            value = getattr(self, column.name)
            if isinstance(value, datetime):
                value = value.isoformat() if value else None
            data[column.name] = value
        
        if not include_timestamps:
            data.pop('created_at', None)
            data.pop('updated_at', None)
            
        return data
    
    def update_from_dict(self, data: Dict[str, Any]) -> None:
        """Update model from dictionary"""
        for key, value in data.items():
            if hasattr(self, key) and key not in ['id', 'created_at', 'updated_at']:
                setattr(self, key, value)
        self.updated_at = datetime.utcnow()
    
    def save(self):
        """Save model to database"""
        db.session.add(self)
        db.session.commit()
        return self
    
    def delete(self):
        """Delete model from database"""
        db.session.delete(self)
        db.session.commit()
    
    @classmethod
    def get_by_id(cls, id: int):
        """Get model by ID"""
        return cls.query.get(id)
    
    @classmethod
    def get_all(cls):
        """Get all models"""
        return cls.query.all()


class User(BaseModel):
    __tablename__ = 'users'
    
    # Basic Info
    name = db.Column(db.String(120), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(512), nullable=False)
    
    # Permissions
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    
    # Preferences
    theme = db.Column(db.String(20), default='dark')
    
    # Relationships
    links = db.relationship("Link", backref="user", lazy='dynamic', cascade="all, delete-orphan")
    schedules = db.relationship("Schedule", backref="user", lazy='dynamic', cascade="all, delete-orphan")
    
    # Constraints
    __table_args__ = (
        db.CheckConstraint('length(username) >= 3', name='username_min_length'),
        db.CheckConstraint('length(name) >= 2', name='name_min_length'),
        db.CheckConstraint("theme IN ('light', 'dark')", name='valid_theme'),
    )

    def set_password(self, password: str) -> None:
        """Set password with validation"""
        if len(password) < 6:
            raise ValueError("Password must be at least 6 characters long")
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Check if password is correct"""
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)
    
    def validate_email(self) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, self.email) is not None
    
    def to_dict(self, include_sensitive: bool = False, include_timestamps: bool = True) -> Dict[str, Any]:
        """Convert user to dictionary"""
        data = super().to_dict(include_timestamps)
        
        # Remove sensitive data by default
        if not include_sensitive:
            data.pop('password_hash', None)
            
        # Add computed fields
        data['links_count'] = self.links.count()
        data['schedules_count'] = self.schedules.count()
        
        return data
    
    def __repr__(self) -> str:
        return f'<User {self.username}>'


class Category(BaseModel):
    __tablename__ = 'categories'
    
    name = db.Column(db.String(80), unique=True, nullable=False, index=True)
    description = db.Column(db.Text)
    color = db.Column(db.String(7))  # HEX color format
    icon = db.Column(db.String(50))
    admin_only = db.Column(db.Boolean, default=False, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    
    # Relationships
    links = db.relationship("Link", backref="category", lazy='dynamic')
    schedules = db.relationship("Schedule", backref="category", lazy='dynamic')
    
    # Constraints
    __table_args__ = (
        db.CheckConstraint('length(name) >= 2', name='category_name_min_length'),
        db.CheckConstraint("color IS NULL OR color REGEXP '^#[0-9A-Fa-f]{6}$'", name='valid_hex_color'),
    )
    
    def validate_color(self) -> bool:
        """Validate HEX color format"""
        if not self.color:
            return True
        pattern = r'^#[0-9A-Fa-f]{6}$'
        return re.match(pattern, self.color) is not None
    
    def can_delete(self) -> bool:
        """Check if category can be deleted (no associated links)"""
        return self.links.count() == 0 and self.schedules.count() == 0
    
    def to_dict(self, include_counts: bool = True, include_timestamps: bool = True) -> Dict[str, Any]:
        """Convert category to dictionary"""
        data = super().to_dict(include_timestamps)
        
        if include_counts:
            data['links_count'] = self.links.count()
            data['schedules_count'] = self.schedules.count()
            data['can_delete'] = self.can_delete()
            
        return data
    
    def __repr__(self) -> str:
        return f'<Category {self.name}>'


class Link(BaseModel):
    __tablename__ = 'links'
    
    title = db.Column(db.String(120), nullable=False, index=True)
    url = db.Column(db.Text, nullable=False)  # URLs can be long
    description = db.Column(db.Text)
    
    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), index=True)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id", ondelete="SET NULL"), index=True)
    
    # Customization
    color = db.Column(db.String(7))  # HEX color format
    image_url = db.Column(db.Text)
    file_url = db.Column(db.Text)
    
    # Status
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    click_count = db.Column(db.Integer, default=0, nullable=False)
    
    # Constraints
    __table_args__ = (
        db.CheckConstraint('length(title) >= 2', name='link_title_min_length'),
        db.CheckConstraint('length(url) >= 7', name='link_url_min_length'),  # http://
        db.CheckConstraint("color IS NULL OR color REGEXP '^#[0-9A-Fa-f]{6}$'", name='link_valid_hex_color'),
        db.CheckConstraint('click_count >= 0', name='link_positive_clicks'),
    )
    
    def validate_url(self) -> bool:
        """Validate URL format"""
        url_pattern = r'^https?://[\w\.-]+\.[a-zA-Z]{2,}/?.*$'
        return re.match(url_pattern, self.url) is not None
    
    def increment_clicks(self) -> None:
        """Increment click counter"""
        self.click_count += 1
        db.session.commit()
    
    def to_dict(self, include_user: bool = False, include_timestamps: bool = True) -> Dict[str, Any]:
        """Convert link to dictionary"""
        data = super().to_dict(include_timestamps)
        
        # Add related data
        if self.category:
            data['category'] = {
                'id': self.category.id,
                'name': self.category.name,
                'color': self.category.color
            }
        else:
            data['category'] = None
            
        if include_user and self.user:
            data['user'] = {
                'id': self.user.id,
                'username': self.user.username,
                'name': self.user.name
            }
        elif include_user:
            data['user'] = None
            
        # Convert snake_case to camelCase for frontend
        frontend_data = {
            'id': data['id'],
            'title': data['title'],
            'url': data['url'],
            'description': data['description'],
            'category': data['category'],
            'categoryId': data['category_id'],
            'color': data['color'],
            'imageUrl': data['image_url'],
            'fileUrl': data['file_url'],
            'userId': data['user_id'],
            'isActive': data['is_active'],
            'clickCount': data['click_count'],
        }
        
        if include_user:
            frontend_data['user'] = data.get('user')
            
        if include_timestamps:
            frontend_data['createdAt'] = data['created_at']
            frontend_data['updatedAt'] = data['updated_at']
            
        return frontend_data
    
    def __repr__(self) -> str:
        return f'<Link {self.title}>'


class Schedule(BaseModel):
    __tablename__ = 'schedules'
    
    title = db.Column(db.String(120), nullable=False, index=True)
    description = db.Column(db.Text)
    file_url = db.Column(db.Text, nullable=False)
    file_name = db.Column(db.String(255))
    file_size = db.Column(db.Integer)  # in bytes
    
    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), index=True)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id", ondelete="SET NULL"), index=True)
    
    # Status and Analytics
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    download_count = db.Column(db.Integer, default=0, nullable=False)
    
    # Constraints
    __table_args__ = (
        db.CheckConstraint('length(title) >= 2', name='schedule_title_min_length'),
        db.CheckConstraint('download_count >= 0', name='schedule_positive_downloads'),
    )
    
    def increment_downloads(self) -> None:
        """Increment download counter"""
        self.download_count += 1
        db.session.commit()
    
    def to_dict(self, include_user: bool = False, include_timestamps: bool = True) -> Dict[str, Any]:
        """Convert schedule to dictionary"""
        data = super().to_dict(include_timestamps)
        
        # Add related data
        if self.category:
            data['category'] = {
                'id': self.category.id,
                'name': self.category.name,
                'color': self.category.color
            }
        else:
            data['category'] = None
            
        if include_user and self.user:
            data['user'] = {
                'id': self.user.id,
                'username': self.user.username,
                'name': self.user.name
            }
        elif include_user:
            data['user'] = None
            
        # Convert snake_case to camelCase for frontend
        frontend_data = {
            'id': data['id'],
            'title': data['title'],
            'description': data['description'],
            'fileUrl': data['file_url'],
            'fileName': data['file_name'],
            'fileSize': data['file_size'],
            'category': data['category'],
            'categoryId': data['category_id'],
            'userId': data['user_id'],
            'isActive': data['is_active'],
            'downloadCount': data['download_count'],
        }
        
        if include_user:
            frontend_data['user'] = data.get('user')
            
        if include_timestamps:
            frontend_data['createdAt'] = data['created_at']
            frontend_data['updatedAt'] = data['updated_at']
            
        return frontend_data
    
    def __repr__(self) -> str:
        return f'<Schedule {self.title}>'


class Color(BaseModel):
    __tablename__ = 'colors'
    
    name = db.Column(db.String(50), nullable=False)
    value = db.Column(db.String(7), unique=True, nullable=False, index=True)  # HEX format
    is_default = db.Column(db.Boolean, default=False, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    
    # Constraints
    __table_args__ = (
        db.CheckConstraint('length(name) >= 2', name='color_name_min_length'),
        db.CheckConstraint("value REGEXP '^#[0-9A-Fa-f]{6}$'", name='color_valid_hex'),
    )
    
    def validate_hex(self) -> bool:
        """Validate HEX color format"""
        pattern = r'^#[0-9A-Fa-f]{6}$'
        return re.match(pattern, self.value) is not None
    
    @classmethod
    def get_default_colors(cls):
        """Get default color palette"""
        return cls.query.filter_by(is_default=True, is_active=True).all()
    
    @classmethod
    def get_active_colors(cls):
        """Get all active colors"""
        return cls.query.filter_by(is_active=True).order_by(cls.name).all()
    
    def to_dict(self, include_timestamps: bool = False) -> Dict[str, Any]:
        """Convert color to dictionary"""
        data = super().to_dict(include_timestamps)
        return {
            'id': data['id'],
            'name': data['name'],
            'value': data['value'],
            'isDefault': data['is_default'],
            'isActive': data['is_active'],
            'createdAt': data.get('created_at'),
            'updatedAt': data.get('updated_at'),
        } if include_timestamps else {
            'id': data['id'],
            'name': data['name'],
            'value': data['value'],
            'isDefault': data['is_default'],
            'isActive': data['is_active'],
        }
    
    def __repr__(self) -> str:
        return f'<Color {self.name} ({self.value})>'


