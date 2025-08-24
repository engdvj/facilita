from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class BaseSchema(BaseModel):
    """Base schema with common configuration."""
    
    class Config:
        from_attributes = True  # For Pydantic v2
        validate_assignment = True
        str_strip_whitespace = True


class TimestampMixin(BaseModel):
    """Mixin for models with timestamp fields."""
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class PaginationSchema(BaseModel):
    """Schema for pagination parameters."""
    page: int = Field(default=1, ge=1, description="Page number")
    per_page: int = Field(default=10, ge=1, le=100, description="Items per page")
    
    @property
    def offset(self) -> int:
        """Calculate offset for database query."""
        return (self.page - 1) * self.per_page


class PaginatedResponse(BaseModel):
    """Schema for paginated responses."""
    items: list
    page: int
    per_page: int
    total: int
    pages: int
    has_prev: bool
    has_next: bool
    
    @classmethod
    def create(cls, items: list, page: int, per_page: int, total: int):
        """Create paginated response from items and metadata."""
        pages = (total + per_page - 1) // per_page  # Ceiling division
        return cls(
            items=items,
            page=page,
            per_page=per_page,
            total=total,
            pages=pages,
            has_prev=page > 1,
            has_next=page < pages
        )