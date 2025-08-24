"""Base service class with common functionality."""

from abc import ABC, abstractmethod
from typing import Type, TypeVar, Generic, Optional, List
from sqlalchemy.exc import IntegrityError

from ..extensions import db
from ..models.base import BaseModel

ModelType = TypeVar('ModelType', bound=BaseModel)


class BaseService(Generic[ModelType], ABC):
    """Base service class for CRUD operations."""
    
    def __init__(self, model_class: Type[ModelType]):
        self.model_class = model_class
    
    def get_by_id(self, id: int) -> Optional[ModelType]:
        """Get model instance by ID."""
        return self.model_class.query.get(id)
    
    def get_by_id_or_404(self, id: int) -> ModelType:
        """Get model instance by ID or raise 404."""
        return self.model_class.query.get_or_404(id)
    
    def get_all(self, active_only: bool = True) -> List[ModelType]:
        """Get all model instances."""
        query = self.model_class.query
        if active_only and hasattr(self.model_class, 'is_active'):
            query = query.filter_by(is_active=True)
        return query.all()
    
    def create(self, data: dict) -> ModelType:
        """Create new model instance."""
        try:
            instance = self.model_class(**data)
            
            # Validate if method exists
            if hasattr(instance, 'validate'):
                instance.validate()
            
            db.session.add(instance)
            db.session.commit()
            return instance
            
        except IntegrityError as e:
            db.session.rollback()
            raise ValueError(f"Data integrity error: {str(e)}")
        except Exception as e:
            db.session.rollback()
            raise e
    
    def update(self, id: int, data: dict) -> ModelType:
        """Update model instance."""
        try:
            instance = self.get_by_id_or_404(id)
            
            for key, value in data.items():
                if hasattr(instance, key):
                    setattr(instance, key, value)
            
            # Validate if method exists
            if hasattr(instance, 'validate'):
                instance.validate()
            
            db.session.commit()
            return instance
            
        except IntegrityError as e:
            db.session.rollback()
            raise ValueError(f"Data integrity error: {str(e)}")
        except Exception as e:
            db.session.rollback()
            raise e
    
    def delete(self, id: int) -> bool:
        """Delete model instance."""
        try:
            instance = self.get_by_id_or_404(id)
            db.session.delete(instance)
            db.session.commit()
            return True
            
        except Exception as e:
            db.session.rollback()
            raise e
    
    def soft_delete(self, id: int) -> ModelType:
        """Soft delete model instance (set is_active=False)."""
        if not hasattr(self.model_class, 'is_active'):
            raise ValueError("Model does not support soft delete")
        
        return self.update(id, {'is_active': False})
    
    def count(self, active_only: bool = True) -> int:
        """Count model instances."""
        query = self.model_class.query
        if active_only and hasattr(self.model_class, 'is_active'):
            query = query.filter_by(is_active=True)
        return query.count()
    
    def paginate(self, page: int = 1, per_page: int = 10, active_only: bool = True):
        """Paginate model instances."""
        query = self.model_class.query
        if active_only and hasattr(self.model_class, 'is_active'):
            query = query.filter_by(is_active=True)
        
        return query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
    
    @abstractmethod
    def get_filtered(self, filters: dict) -> List[ModelType]:
        """Get filtered model instances. Must be implemented by subclasses."""
        pass