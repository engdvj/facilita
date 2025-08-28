from flask import Blueprint, request, session, jsonify, current_app
from ..extensions import db
from ..models import User, Link, Category
from ..middleware.decorators import login_required, get_current_user
from ..utils.validation import validate_required_fields, clean_payload, handle_nullable_fields

bp = Blueprint("links", __name__)


@bp.get("/")
def list_links():
    user_id = session.get("user_id")
    
    if not user_id:
        # Non-authenticated users see only public links
        links = (
            Link.query.join(Category, isouter=True)
            .filter(
                ((Category.admin_only == False) | (Link.category == None))
                & (Link.user_id == None)
            )
            .all()
        )
        include_user = False
    else:
        user = User.query.get(user_id)
        if user.is_admin:
            # Admins see all links
            links = Link.query.all()
            include_user = True
        else:
            # Regular users see public links + their own links
            links = (
                Link.query.join(Category, isouter=True)
                .filter(
                    (Link.user_id == user_id)
                    | (
                        (Link.user_id == None)
                        & ((Category.admin_only == False) | (Link.category == None))
                    )
                )
                .all()
            )
            include_user = False
    
    result = [l.to_dict(include_user=include_user) for l in links]
    # Debug: log sample link data
    if result:
        print(f"DEBUG: Sample link data returned: {result[0]}")
    return jsonify(result)


@bp.post("/")
@login_required
def create_link():
    data = request.get_json() or {}
    
    # Debug: log incoming data for creation
    current_app.logger.info(f"DEBUG: Creating link with data: {data}")
    
    # Validate required fields
    title = data.get("title")
    url = data.get("url")
    file_url = data.get("file_url")
    
    if not title or (not url and not file_url):
        return {"message": "Missing title or url"}, 400
    
    if not url:
        url = file_url
    
    current_user = get_current_user()
    
    # Only admins can create links with file_url
    if not current_user.is_admin and file_url:
        return {"message": "Forbidden"}, 403
    
    # Determine link owner
    owner_id = session["user_id"]
    if current_user.is_admin and "user_id" in data:
        owner_id = data.get("user_id")
    
    # Clean and prepare data
    allowed_fields = ["category_id", "color", "image_url", "is_public", "is_favorite"]
    if current_user.is_admin:
        allowed_fields.extend(["file_url", "user_id"])
    
    link_data = clean_payload(data, allowed_fields)
    link_data.update({
        "title": title,
        "url": url,
        "user_id": owner_id
    })
    
    if file_url and current_user.is_admin:
        link_data["file_url"] = file_url
    
    # Handle nullable fields
    link_data = handle_nullable_fields(link_data, ["category_id"])
    
    # Debug: log final data before creating
    print(f"DEBUG: Final link_data before creation: {link_data}")
    
    link = Link(**link_data)
    db.session.add(link)
    db.session.commit()
    
    # Debug: log created link
    print(f"DEBUG: Created link - ID: {link.id}, image_url: {link.image_url}")
    
    return link.to_dict(include_user=True), 201


@bp.patch("/<int:link_id>")
@bp.put("/<int:link_id>")
@login_required
def update_link(link_id):
    link = Link.query.get_or_404(link_id)
    current_user = get_current_user()
    
    # Check permissions
    if not current_user.is_admin and link.user_id != current_user.id:
        return {"message": "Forbidden"}, 403
    
    data = request.get_json() or {}
    
    # Debug: log incoming data
    print(f"DEBUG: Updating link {link_id} with data: {data}")
    
    # Only admins can modify file_url
    if not current_user.is_admin and "file_url" in data:
        return {"message": "Forbidden"}, 403
    
    # Define allowed fields based on user role
    allowed_fields = ["title", "url", "category_id", "color", "image_url", "is_public", "is_favorite"]
    if current_user.is_admin:
        allowed_fields.extend(["file_url", "user_id"])
    
    # Update link fields
    for field in allowed_fields:
        if field in data:
            old_value = getattr(link, field, None)
            setattr(link, field, data[field])
            print(f"DEBUG: Updated {field}: {old_value} -> {data[field]}")
    
    # Debug: check final state
    print(f"DEBUG: Link image_url after update: {link.image_url}")
    
    # Handle nullable fields
    if link.category_id is None:
        link.category_id = None
    
    db.session.commit()
    return link.to_dict(include_user=True)


@bp.delete("/<int:link_id>")
@login_required
def delete_link(link_id):
    link = Link.query.get_or_404(link_id)
    current_user = get_current_user()
    
    # Check permissions
    if not current_user.is_admin and link.user_id != current_user.id:
        return {"message": "Forbidden"}, 403
    
    db.session.delete(link)
    db.session.commit()
    return {"message": "deleted"}