"""Link service for business logic related to links."""

from typing import List, Optional
from sqlalchemy import and_, or_

from ..models import Link, Category, User
from ..extensions import db
from .base import BaseService


class LinkService(BaseService[Link]):
    """Service for link-related operations."""
    
    def __init__(self):
        super().__init__(Link)
    
    def get_filtered(self, filters: dict) -> List[Link]:
        """Get filtered links based on various criteria."""
        query = self.model_class.query
        
        if filters.get('user_id'):
            query = query.filter_by(user_id=filters['user_id'])
        
        if filters.get('category_id'):
            query = query.filter_by(category_id=filters['category_id'])
        
        if filters.get('is_public'):
            query = query.filter_by(user_id=None)
        
        if filters.get('search'):
            search_term = f"%{filters['search']}%"
            query = query.filter(
                or_(
                    Link.title.ilike(search_term),
                    Link.description.ilike(search_term)
                )
            )
        
        if filters.get('active_only', True):
            query = query.filter_by(is_active=True)
        
        return query.order_by(Link.sort_order, Link.title).all()
    
    def get_public_links(self) -> List[Link]:
        """Get all public links (no user assigned)."""
        return (
            Link.query.join(Category, isouter=True)
            .filter(
                and_(
                    Link.user_id.is_(None),
                    Link.is_active == True,
                    or_(
                        Category.admin_only == False,
                        Link.category_id.is_(None)
                    )
                )
            )
            .order_by(Link.sort_order, Link.title)
            .all()
        )
    
    def get_user_accessible_links(self, user_id: int, is_admin: bool = False) -> List[Link]:
        """Get links accessible to a specific user."""
        if is_admin:
            # Admins see all links
            return self.get_all()
        
        # Regular users see public links + their own links
        return (
            Link.query.join(Category, isouter=True)
            .filter(
                and_(
                    Link.is_active == True,
                    or_(
                        Link.user_id == user_id,
                        and_(
                            Link.user_id.is_(None),
                            or_(
                                Category.admin_only == False,
                                Link.category_id.is_(None)
                            )
                        )
                    )
                )
            )
            .order_by(Link.sort_order, Link.title)
            .all()
        )
    
    def get_user_links(self, user_id: int) -> List[Link]:
        """Get all links belonging to a specific user."""
        return (
            Link.query
            .filter_by(user_id=user_id, is_active=True)
            .order_by(Link.sort_order, Link.title)
            .all()
        )
    
    def get_category_links(self, category_id: int, user_id: Optional[int] = None, is_admin: bool = False) -> List[Link]:
        """Get all links in a specific category."""
        query = Link.query.filter_by(category_id=category_id, is_active=True)
        
        if not is_admin:
            # Non-admin users only see public links or their own links
            if user_id:
                query = query.filter(
                    or_(
                        Link.user_id == user_id,
                        Link.user_id.is_(None)
                    )
                )
            else:
                query = query.filter(Link.user_id.is_(None))
        
        return query.order_by(Link.sort_order, Link.title).all()
    
    def increment_click_count(self, link_id: int) -> Link:
        """Increment click count for a link."""
        link = self.get_by_id_or_404(link_id)
        link.increment_clicks()
        return link
    
    def create_link(self, data: dict, user_id: int, is_admin: bool = False) -> Link:
        """Create a new link with proper permissions."""
        # Set owner
        if is_admin and 'user_id' in data:
            # Admin can assign link to any user or make it public
            owner_id = data.get('user_id')
        else:
            # Regular users can only create links for themselves
            owner_id = user_id
        
        # Only admins can create links with file_url
        if not is_admin and data.get('file_url'):
            raise ValueError("Only administrators can create links with file attachments")
        
        # Prepare link data
        link_data = {
            'title': data['title'],
            'url': data.get('url'),
            'file_url': data.get('file_url') if is_admin else None,
            'description': data.get('description'),
            'color': data.get('color'),
            'image_url': data.get('image_url'),
            'category_id': data.get('category_id'),
            'user_id': owner_id,
            'sort_order': data.get('sort_order', 0)
        }
        
        # Ensure either URL or file_url is provided
        if not link_data['url'] and not link_data['file_url']:
            raise ValueError("Either URL or file URL must be provided")
        
        # If file_url is provided but no URL, use file_url as URL
        if not link_data['url'] and link_data['file_url']:
            link_data['url'] = link_data['file_url']
        
        return self.create(link_data)
    
    def update_link(self, link_id: int, data: dict, user_id: int, is_admin: bool = False) -> Link:
        """Update a link with proper permissions."""
        link = self.get_by_id_or_404(link_id)
        
        # Check permissions
        if not is_admin and link.user_id != user_id:
            raise ValueError("You can only edit your own links")
        
        # Only admins can modify file_url
        if not is_admin and 'file_url' in data:
            raise ValueError("Only administrators can modify file attachments")
        
        # Filter allowed fields
        allowed_fields = ['title', 'url', 'description', 'color', 'image_url', 'category_id', 'sort_order']
        if is_admin:
            allowed_fields.extend(['file_url', 'user_id', 'is_active'])
        
        update_data = {k: v for k, v in data.items() if k in allowed_fields}
        
        return self.update(link_id, update_data)
    
    def delete_link(self, link_id: int, user_id: int, is_admin: bool = False) -> bool:
        """Delete a link with proper permissions."""
        link = self.get_by_id_or_404(link_id)
        
        # Check permissions
        if not is_admin and link.user_id != user_id:
            raise ValueError("You can only delete your own links")
        
        return self.delete(link_id)
    
    def get_link_stats(self) -> dict:
        """Get link statistics."""
        total_links = self.count(active_only=False)
        active_links = self.count(active_only=True)
        public_links = Link.query.filter_by(user_id=None, is_active=True).count()
        user_links = Link.query.filter(Link.user_id.isnot(None)).count()
        
        total_clicks = db.session.query(
            db.func.sum(Link.click_count)
        ).scalar() or 0
        
        return {
            "total_links": total_links,
            "active_links": active_links,
            "public_links": public_links,
            "user_links": user_links,
            "total_clicks": total_clicks
        }