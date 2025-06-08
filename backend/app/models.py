from .extensions import db
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)


class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    color = db.Column(db.String(30))
    icon = db.Column(db.String(50))


class Link(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    url = db.Column(db.String(255), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("category.id"))
    category = db.relationship("Category", backref="links")
    color = db.Column(db.String(30))
    image_url = db.Column(db.String(255))

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "url": self.url,
            "category": self.category.name if self.category else None,
            "categoryId": self.category_id,
            "color": self.color,
            "imageUrl": self.image_url,
        }


class Color(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    value = db.Column(db.String(30), unique=True, nullable=False)
    name = db.Column(db.String(50))
    type = db.Column(db.String(10))
