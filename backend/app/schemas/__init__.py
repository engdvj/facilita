"""Schemas package for request/response validation."""

from .base import BaseSchema, TimestampMixin, PaginationSchema, PaginatedResponse
from .user import (
    UserCreate, UserUpdate, UserLogin, UserChangePassword,
    UserResponse, UserListResponse
)
from .link import (
    LinkCreate, LinkUpdate, LinkResponse, LinkListResponse, LinkStatsResponse
)
from .category import (
    CategoryCreate, CategoryUpdate, CategoryResponse, CategoryListResponse
)

# Export all schemas
__all__ = [
    # Base schemas
    'BaseSchema', 'TimestampMixin', 'PaginationSchema', 'PaginatedResponse',
    
    # User schemas
    'UserCreate', 'UserUpdate', 'UserLogin', 'UserChangePassword',
    'UserResponse', 'UserListResponse',
    
    # Link schemas
    'LinkCreate', 'LinkUpdate', 'LinkResponse', 'LinkListResponse', 'LinkStatsResponse',
    
    # Category schemas
    'CategoryCreate', 'CategoryUpdate', 'CategoryResponse', 'CategoryListResponse',
]