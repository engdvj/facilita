from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
from .base import BaseSchema, TimestampMixin


class UserCreate(BaseSchema):
    """Schema for creating a new user."""
    username: str = Field(..., min_length=3, max_length=80, description="Unique username")
    password: str = Field(..., min_length=6, max_length=128, description="Password")
    is_admin: bool = Field(default=False, description="Admin privileges")
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v):
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('Username can only contain letters, numbers, hyphens and underscores')
        return v.lower()


class UserUpdate(BaseSchema):
    """Schema for updating user data."""
    username: Optional[str] = Field(None, min_length=3, max_length=80)
    password: Optional[str] = Field(None, min_length=6, max_length=128)
    is_admin: Optional[bool] = None
    is_active: Optional[bool] = None
    theme: Optional[Dict[str, Any]] = None
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v):
        if v and not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('Username can only contain letters, numbers, hyphens and underscores')
        return v.lower() if v else v


class UserLogin(BaseSchema):
    """Schema for user login."""
    username: str = Field(..., description="Username")
    password: str = Field(..., description="Password")


class UserChangePassword(BaseSchema):
    """Schema for changing user password."""
    old_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=6, max_length=128, description="New password")


class UserResponse(BaseSchema, TimestampMixin):
    """Schema for user response data."""
    id: int
    username: str
    is_admin: bool
    is_active: bool
    theme: Optional[Dict[str, Any]] = None
    last_login: Optional[datetime] = None
    links_count: Optional[int] = None
    schedules_count: Optional[int] = None


class UserListResponse(BaseSchema):
    """Schema for user list response."""
    id: int
    username: str
    is_admin: bool
    is_active: bool
    created_at: datetime
    links_count: Optional[int] = None