from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required
from ..extensions import db
from ..models import User, Link, Category

bp = Blueprint('api', __name__)


@bp.post('/auth/login')
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return {'message': 'Missing credentials'}, 400
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        token = create_access_token(identity=user.id)
        return {'access_token': token}
    return {'message': 'Invalid credentials'}, 401


@bp.get('/links')
def list_links():
    links = Link.query.all()
    return jsonify([l.to_dict() for l in links])


@bp.get('/categories')
def list_categories():
    categories = Category.query.all()
    return jsonify([{ 'id': c.id, 'name': c.name, 'color': c.color, 'icon': c.icon } for c in categories])


@bp.post('/links')
@jwt_required()
def create_link():
    data = request.get_json() or {}
    link = Link(
        title=data.get('title'),
        url=data.get('url'),
        category_id=data.get('category_id'),
        color=data.get('color'),
        image_url=data.get('image_url')
    )
    db.session.add(link)
    db.session.commit()
    return link.to_dict(), 201
