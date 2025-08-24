from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from pathlib import Path
import os
import mimetypes

from ..middleware.decorators import login_required, get_current_user

bp = Blueprint("files", __name__)


ALLOWED_EXTENSIONS = {
    'images': {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'},
    'documents': {'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'},
    'archives': {'zip', 'rar', '7z', 'tar', 'gz'},
    'other': {'csv', 'json', 'xml'}
}

MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB


def get_file_category(filename):
    """Get file category based on extension."""
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    
    for category, extensions in ALLOWED_EXTENSIONS.items():
        if ext in extensions:
            return category
    return 'other'


def is_allowed_file(filename):
    """Check if file extension is allowed."""
    if '.' not in filename:
        return False
    
    ext = filename.rsplit('.', 1)[1].lower()
    all_allowed = set()
    for extensions in ALLOWED_EXTENSIONS.values():
        all_allowed.update(extensions)
    
    return ext in all_allowed


def get_unique_filename(upload_dir, filename):
    """Generate unique filename if file already exists."""
    target = upload_dir / filename
    
    if not target.exists():
        return filename
    
    name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
    counter = 1
    
    while True:
        new_name = f"{name}_{counter}.{ext}" if ext else f"{name}_{counter}"
        if not (upload_dir / new_name).exists():
            return new_name
        counter += 1


@bp.post("/upload")
@login_required
def upload_file():
    """Upload a file to the server."""
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return {"message": "No file provided"}, 400
        
        file = request.files['file']
        if file.filename == '':
            return {"message": "No file selected"}, 400
        
        # Validate file
        if not is_allowed_file(file.filename):
            return {"message": "File type not allowed"}, 400
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return {"message": f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"}, 400
        
        # Secure filename and ensure uniqueness
        filename = secure_filename(file.filename)
        upload_dir = Path(current_app.config["UPLOAD_FOLDER"])
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        unique_filename = get_unique_filename(upload_dir, filename)
        file_path = upload_dir / unique_filename
        
        # Save file
        file.save(file_path)
        
        # Get file info
        file_category = get_file_category(unique_filename)
        mime_type, _ = mimetypes.guess_type(str(file_path))
        
        return {
            "message": "File uploaded successfully",
            "url": f"/api/files/{unique_filename}",
            "filename": unique_filename,
            "original_name": file.filename,
            "size": file_size,
            "type": mime_type,
            "category": file_category
        }, 201
        
    except Exception as e:
        return {"message": f"Error uploading file: {str(e)}"}, 500


@bp.get("/<path:filename>")
def serve_file(filename: str):
    """Serve uploaded files."""
    try:
        upload_dir = Path(current_app.config["UPLOAD_FOLDER"])
        file_path = upload_dir / filename
        
        if not file_path.exists() or not file_path.is_file():
            return {"message": "File not found"}, 404
        
        # Security check: ensure file is within upload directory
        if not str(file_path.resolve()).startswith(str(upload_dir.resolve())):
            return {"message": "Access denied"}, 403
        
        return send_from_directory(upload_dir, filename)
        
    except Exception as e:
        return {"message": f"Error serving file: {str(e)}"}, 500


@bp.get("/info/<path:filename>")
@login_required
def get_file_info(filename: str):
    """Get information about a file."""
    try:
        upload_dir = Path(current_app.config["UPLOAD_FOLDER"])
        file_path = upload_dir / filename
        
        if not file_path.exists() or not file_path.is_file():
            return {"message": "File not found"}, 404
        
        # Get file stats
        stat = file_path.stat()
        mime_type, _ = mimetypes.guess_type(str(file_path))
        
        return {
            "filename": filename,
            "size": stat.st_size,
            "type": mime_type,
            "category": get_file_category(filename),
            "created": stat.st_ctime,
            "modified": stat.st_mtime,
            "url": f"/api/files/{filename}"
        }
        
    except Exception as e:
        return {"message": f"Error getting file info: {str(e)}"}, 500


@bp.delete("/<path:filename>")
@login_required
def delete_file(filename: str):
    """Delete a file (admin only or file owner)."""
    try:
        user = get_current_user()
        
        # Only admins can delete files for now
        # TODO: Add file ownership tracking
        if not user.is_admin:
            return {"message": "Permission denied"}, 403
        
        upload_dir = Path(current_app.config["UPLOAD_FOLDER"])
        file_path = upload_dir / filename
        
        if not file_path.exists():
            return {"message": "File not found"}, 404
        
        # Security check
        if not str(file_path.resolve()).startswith(str(upload_dir.resolve())):
            return {"message": "Access denied"}, 403
        
        file_path.unlink()
        
        return {"message": "File deleted successfully"}
        
    except Exception as e:
        return {"message": f"Error deleting file: {str(e)}"}, 500


@bp.get("/")
@login_required
def list_files():
    """List all uploaded files (admin only)."""
    try:
        user = get_current_user()
        
        if not user.is_admin:
            return {"message": "Permission denied"}, 403
        
        upload_dir = Path(current_app.config["UPLOAD_FOLDER"])
        
        if not upload_dir.exists():
            return {"files": []}
        
        files = []
        for file_path in upload_dir.iterdir():
            if file_path.is_file():
                stat = file_path.stat()
                mime_type, _ = mimetypes.guess_type(str(file_path))
                
                files.append({
                    "filename": file_path.name,
                    "size": stat.st_size,
                    "type": mime_type,
                    "category": get_file_category(file_path.name),
                    "created": stat.st_ctime,
                    "modified": stat.st_mtime,
                    "url": f"/api/files/{file_path.name}"
                })
        
        # Sort by creation time, newest first
        files.sort(key=lambda x: x['created'], reverse=True)
        
        return {"files": files}
        
    except Exception as e:
        return {"message": f"Error listing files: {str(e)}"}, 500