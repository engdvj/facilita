"""Database utilities and initialization helpers."""

from sqlalchemy import inspect, text
from ..extensions import db
from ..models import User


def ensure_tables_exist():
    """Ensure all database tables exist."""
    db.create_all()


def add_missing_columns():
    """Add any missing columns to existing tables."""
    inspector = inspect(db.engine)
    
    # Add missing columns to color table
    color_cols = [c["name"] for c in inspector.get_columns("color")]
    if "name" not in color_cols:
        db.session.execute(text("ALTER TABLE color ADD COLUMN name VARCHAR(50)"))
        db.session.commit()

    # Add missing columns to category table
    category_cols = [c["name"] for c in inspector.get_columns("category")]
    if "admin_only" not in category_cols:
        db.session.execute(
            text("ALTER TABLE category ADD COLUMN admin_only BOOLEAN DEFAULT 0")
        )
        db.session.commit()

    # Add missing columns to user table
    user_cols = [c["name"] for c in inspector.get_columns("user")]
    if "is_admin" not in user_cols:
        db.session.execute(
            text("ALTER TABLE user ADD COLUMN is_admin BOOLEAN DEFAULT 0")
        )
        db.session.commit()
        db.session.execute(
            text("UPDATE user SET is_admin = 1 WHERE username = 'admin'")
        )
        db.session.commit()
    
    if "theme" not in user_cols:
        db.session.execute(text("ALTER TABLE user ADD COLUMN theme TEXT"))
        db.session.commit()

    # Add missing columns to link table
    link_cols = [c["name"] for c in inspector.get_columns("link")]
    if "user_id" not in link_cols:
        db.session.execute(text("ALTER TABLE link ADD COLUMN user_id INTEGER"))
        db.session.commit()
    
    if "file_url" not in link_cols:
        db.session.execute(text("ALTER TABLE link ADD COLUMN file_url VARCHAR(255)"))
        db.session.commit()


def ensure_admin_user(username="admin", password="admin123"):
    """Ensure admin user exists and is properly configured."""
    admin = User.query.filter_by(username=username).first()
    
    if not admin:
        admin = User(username=username, is_admin=True)
        db.session.add(admin)
    
    # Always update password and admin status
    admin.set_password(password)
    admin.is_admin = True
    db.session.commit()
    
    return admin


def initialize_database():
    """Initialize database with all necessary tables and data."""
    ensure_tables_exist()
    add_missing_columns()
    
    # Get admin credentials from environment
    import os
    admin_username = os.getenv("ADMIN_USERNAME", "admin")
    admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
    
    ensure_admin_user(admin_username, admin_password)