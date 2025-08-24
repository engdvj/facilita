from typing import Optional
from pydantic import BaseModel, Field, field_validator
from .base import BaseSchema, TimestampMixin


class CategoryCreate(BaseSchema):
    """Schema for creating a new category."""
    name: str = Field(..., min_length=1, max_length=80, description="Category name")
    color: Optional[str] = Field(None, max_length=30, description="Category color")
    icon: Optional[str] = Field(None, max_length=50, description="Category icon")
    description: Optional[str] = Field(None, max_length=500, description="Category description")
    admin_only: bool = Field(default=False, description="Admin only category")
    sort_order: int = Field(default=0, description="Sort order")
    
    @field_validator('color')
    @classmethod
    def validate_color(cls, v):
        if v and not v.startswith('#'):
            raise ValueError('Color must be in hex format (e.g., #FF0000)')
        return v
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        return v.strip().title()


class CategoryUpdate(BaseSchema):
    """Schema for updating category data."""
    name: Optional[str] = Field(None, min_length=1, max_length=80)
    color: Optional[str] = Field(None, max_length=30)
    icon: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = Field(None, max_length=500)
    admin_only: Optional[bool] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None
    
    @field_validator('color')
    @classmethod
    def validate_color(cls, v):
        if v and not v.startswith('#'):
            raise ValueError('Color must be in hex format (e.g., #FF0000)')
        return v
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        return v.strip().title() if v else v


class CategoryResponse(BaseSchema, TimestampMixin):
    """Schema for category response data."""
    id: int
    name: str
    color: Optional[str] = None
    icon: Optional[str] = None
    description: Optional[str] = None
    admin_only: bool
    is_active: bool
    sort_order: int
    links_count: Optional[int] = None
    schedules_count: Optional[int] = None


class CategoryListResponse(BaseSchema):
    """Schema for category list response."""
    id: int
    name: str
    color: Optional[str] = None
    icon: Optional[str] = None
    admin_only: bool
    is_active: bool
    links_count: Optional[int] = None