import os
import tempfile
import pytest
from backend.app import create_app
from backend.app.extensions import db
from backend.app.models import User

@pytest.fixture()
def app():
    db_fd, db_path = tempfile.mkstemp()
    os.close(db_fd)
    os.environ['DATABASE_URL'] = f'sqlite:///{db_path}'
    os.environ['SECRET_KEY'] = 'test-secret'
    app = create_app()
    app.config.update({'TESTING': True})

    with app.app_context():
        admin = User(username='admin')
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
    yield app

    os.remove(db_path)

@pytest.fixture()
def client(app):
    return app.test_client()
