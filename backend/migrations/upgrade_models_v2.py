"""
Database Migration Script - Models v2.0
Upgrade existing database to new model structure
"""
import sqlite3
from datetime import datetime


def upgrade_database(db_path: str = 'instance/facilita.sqlite'):
    """Upgrade database schema to v2.0"""
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("Starting database upgrade to v2.0...")
        
        # Add new columns to existing tables
        upgrade_commands = [
            # Users table upgrades
            "ALTER TABLE user ADD COLUMN name TEXT",
            "ALTER TABLE user ADD COLUMN email TEXT",
            "ALTER TABLE user ADD COLUMN is_active BOOLEAN DEFAULT 1",
            "ALTER TABLE user ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE user ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            
            # Categories table upgrades  
            "ALTER TABLE category ADD COLUMN description TEXT",
            "ALTER TABLE category ADD COLUMN is_active BOOLEAN DEFAULT 1",
            "ALTER TABLE category ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE category ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            
            # Links table upgrades
            "ALTER TABLE link ADD COLUMN description TEXT",
            "ALTER TABLE link ADD COLUMN is_active BOOLEAN DEFAULT 1", 
            "ALTER TABLE link ADD COLUMN click_count INTEGER DEFAULT 0",
            "ALTER TABLE link ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE link ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            
            # Schedules table upgrades
            "ALTER TABLE schedule ADD COLUMN description TEXT",
            "ALTER TABLE schedule ADD COLUMN file_name TEXT",
            "ALTER TABLE schedule ADD COLUMN file_size INTEGER",
            "ALTER TABLE schedule ADD COLUMN is_active BOOLEAN DEFAULT 1",
            "ALTER TABLE schedule ADD COLUMN download_count INTEGER DEFAULT 0",
            "ALTER TABLE schedule ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE schedule ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            
            # Colors table upgrades
            "ALTER TABLE color ADD COLUMN is_default BOOLEAN DEFAULT 0",
            "ALTER TABLE color ADD COLUMN is_active BOOLEAN DEFAULT 1",
            "ALTER TABLE color ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE color ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",
        ]
        
        for command in upgrade_commands:
            try:
                cursor.execute(command)
                print(f"✓ {command}")
            except sqlite3.OperationalError as e:
                if "duplicate column name" in str(e):
                    print(f"⚠ Column already exists: {command}")
                else:
                    print(f"✗ Error: {command} - {e}")
        
        # Update existing data with default values
        print("\nUpdating existing records...")
        
        # Set default names for users (using username)
        cursor.execute("UPDATE user SET name = username WHERE name IS NULL")
        
        # Set default emails for users (username@facilita.local) 
        cursor.execute("UPDATE user SET email = username || '@facilita.local' WHERE email IS NULL")
        
        # Set theme to 'dark' if null
        cursor.execute("UPDATE user SET theme = 'dark' WHERE theme IS NULL OR theme = ''")
        
        # Add default colors if none exist
        default_colors = [
            ('Azul Padrão', '#3B82F6'),
            ('Verde', '#10B981'), 
            ('Roxo', '#8B5CF6'),
            ('Rosa', '#EC4899'),
            ('Amarelo', '#F59E0B'),
            ('Vermelho', '#EF4444'),
            ('Índigo', '#6366F1'),
            ('Teal', '#14B8A6'),
        ]
        
        for name, value in default_colors:
            cursor.execute(
                "INSERT OR IGNORE INTO color (name, value, is_default, is_active) VALUES (?, ?, 1, 1)",
                (name, value)
            )
        
        # Create indexes for performance
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_user_username ON user(username)",
            "CREATE INDEX IF NOT EXISTS idx_user_email ON user(email)",
            "CREATE INDEX IF NOT EXISTS idx_category_name ON category(name)",
            "CREATE INDEX IF NOT EXISTS idx_link_title ON link(title)",
            "CREATE INDEX IF NOT EXISTS idx_link_user_id ON link(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_link_category_id ON link(category_id)",
            "CREATE INDEX IF NOT EXISTS idx_schedule_title ON schedule(title)",
            "CREATE INDEX IF NOT EXISTS idx_schedule_user_id ON schedule(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_color_value ON color(value)",
        ]
        
        print("\nCreating indexes...")
        for index in indexes:
            try:
                cursor.execute(index)
                print(f"✓ {index}")
            except sqlite3.OperationalError as e:
                print(f"⚠ Index already exists or error: {e}")
        
        conn.commit()
        print("\n✅ Database upgrade completed successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"\n❌ Error during upgrade: {e}")
        raise
    
    finally:
        conn.close()


if __name__ == "__main__":
    upgrade_database()