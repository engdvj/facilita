from datetime import datetime
from ..extensions import db


class BaseModel(db.Model):
    """Base model with common fields and methods for all models."""
    __abstract__ = True
    
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self, include_timestamps=False, **kwargs):
        """Convert model instance to dictionary."""
        data = {}
        for column in self.__table__.columns:
            value = getattr(self, column.name)
            if isinstance(value, datetime):
                value = value.isoformat()
            data[column.name] = value
        
        if not include_timestamps:
            data.pop('created_at', None)
            data.pop('updated_at', None)
            
        return data
    
    def update(self, **kwargs):
        """Update model instance with provided values."""
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
        self.updated_at = datetime.utcnow()
    
    @classmethod
    def create(cls, **kwargs):
        """Create and save new instance."""
        instance = cls(**kwargs)
        db.session.add(instance)
        return instance
    
    def save(self):
        """Save instance to database."""
        db.session.add(self)
        db.session.commit()
        return self
    
    def delete(self):
        """Delete instance from database."""
        db.session.delete(self)
        db.session.commit()
        
    def __repr__(self):
        return f"<{self.__class__.__name__} {self.id}>"