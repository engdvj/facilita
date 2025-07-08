from app import create_app
from app.extensions import db
from app.models import User
import os

app = create_app()

with app.app_context():
    db.create_all()
    username = os.getenv('ADMIN_USERNAME', 'admin')
    password = os.getenv('ADMIN_PASSWORD', 'admin123')
    if not User.query.filter_by(username=username).first():
        admin = User(username=username, is_admin=True)
        admin.set_password(password)
        db.session.add(admin)
        db.session.commit()
        print(f'Admin user created: {username}/{password}')
    else:
        print('Admin user already exists')
