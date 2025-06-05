from flask import Blueprint, request, jsonify, session
from functools import wraps
from sqlalchemy.exc import IntegrityError
from ..extensions import db
from ..models import User, Link, Category, Color

bp = Blueprint('api', __name__)


def login_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if not session.get('user_id'):
            return {'message': 'Unauthorized'}, 401
        return func(*args, **kwargs)

    return wrapper


@bp.post('/auth/login')
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return {'message': 'Missing credentials'}, 400
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        session['user_id'] = user.id
        return {'message': 'ok'}
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
@login_required
def create_link():
    data = request.get_json() or {}
    title = data.get('title')
    url = data.get('url')
    if not title or not url:
        return {'message': 'Missing title or url'}, 400
    link = Link(
        title=title,
        url=url,
        category_id=data.get('category_id'),
        color=data.get('color'),
        image_url=data.get('image_url')
    )
    db.session.add(link)
    db.session.commit()
    return link.to_dict(), 201


@bp.post('/categories')
@login_required
def create_category():
    data = request.get_json() or {}
    name = data.get('name')
    if not name:
        return {'message': 'Missing name'}, 400
    category = Category(
        name=name,

        color=data.get('color'),
        icon=data.get('icon')
    )
    db.session.add(category)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return {'message': 'Category already exists'}, 400

    return {
        'id': category.id,
        'name': category.name,
        'color': category.color,
        'icon': category.icon,
    }, 201


@bp.get('/colors')
def list_colors():
    colors = Color.query.all()
    return jsonify([{ 'id': c.id, 'value': c.value } for c in colors])


@bp.post('/colors')
@login_required
def create_color():
    data = request.get_json() or {}
    value = data.get('value')
    if not value:
        return {'message': 'Missing value'}, 400
    color = Color(value=value)
    db.session.add(color)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return {'message': 'Color already exists'}, 400
    return {'id': color.id, 'value': color.value}, 201

