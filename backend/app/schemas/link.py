from typing import Optional
from pydantic import BaseModel, Field, field_validator, HttpUrl
from .base import BaseSchema, TimestampMixin


class LinkCreate(BaseSchema):
    """Schema for creating a new link."""
    title: str = Field(..., min_length=1, max_length=200, description="Link title")
    url: Optional[str] = Field(None, max_length=2048, description="Link URL")
    file_url: Optional[str] = Field(None, max_length=2048, description="File URL")
    description: Optional[str] = Field(None, max_length=1000, description="Link description")
    color: Optional[str] = Field(None, max_length=30, description="Link color")
    image_url: Optional[str] = Field(None, max_length=2048, description="Image URL")
    category_id: Optional[int] = Field(None, description="Category ID")
    user_id: Optional[int] = Field(None, description="User ID (admin only)")
    sort_order: int = Field(default=0, description="Sort order")
    
    @field_validator('color')
    @classmethod
    def validate_color(cls, v):
        if v and not v.startswith('#'):
            raise ValueError('Color must be in hex format (e.g., #FF0000)')
        return v
    
    def model_post_init(self, __context):
        """Validate that either url or file_url is provided."""
        if not self.url and not self.file_url:
            raise ValueError('Either url or file_url must be provided')


class LinkUpdate(BaseSchema):
    """Schema for updating link data."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    url: Optional[str] = Field(None, max_length=2048)
    file_url: Optional[str] = Field(None, max_length=2048)
    description: Optional[str] = Field(None, max_length=1000)
    color: Optional[str] = Field(None, max_length=30)
    image_url: Optional[str] = Field(None, max_length=2048)
    category_id: Optional[int] = None
    user_id: Optional[int] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None
    
    @field_validator('color')
    @classmethod
    def validate_color(cls, v):
        if v and not v.startswith('#'):
            raise ValueError('Color must be in hex format (e.g., #FF0000)')
        return v


class LinkResponse(BaseSchema, TimestampMixin):
    """Schema for link response data."""
    id: int
    title: str
    url: Optional[str] = None
    file_url: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool
    sort_order: int
    click_count: Optional[int] = None
    user_id: Optional[int] = None
    user: Optional[str] = None  # Username
    category_id: Optional[int] = None
    category: Optional[str] = None  # Category name


class LinkListResponse(BaseSchema):
    """Schema for link list response."""
    id: int
    title: str
    url: Optional[str] = None
    category: Optional[str] = None
    user: Optional[str] = None
    is_active: bool
    created_at: Optional[str] = None


class LinkStatsResponse(BaseSchema):
    """Schema for link statistics."""
    total_links: int
    active_links: int
    public_links: int
    user_links: int
    total_clicks: int