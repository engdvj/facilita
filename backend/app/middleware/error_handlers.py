"""Error handling middleware and custom error handlers."""

from flask import jsonify, request
from werkzeug.exceptions import HTTPException
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError, DatabaseError
import traceback
import logging


def register_error_handlers(app):
    """Register custom error handlers with the Flask app."""
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            "error": "bad_request",
            "message": "Bad request",
            "status": 400
        }), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            "error": "unauthorized", 
            "message": "Authentication required",
            "status": 401
        }), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            "error": "forbidden",
            "message": "Insufficient permissions",
            "status": 403
        }), 403
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "error": "not_found",
            "message": "Resource not found",
            "status": 404
        }), 404
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            "error": "method_not_allowed",
            "message": "Method not allowed",
            "status": 405
        }), 405
    
    @app.errorhandler(413)
    def payload_too_large(error):
        return jsonify({
            "error": "payload_too_large",
            "message": "Request payload too large",
            "status": 413
        }), 413
    
    @app.errorhandler(422)
    def unprocessable_entity(error):
        return jsonify({
            "error": "unprocessable_entity",
            "message": "Validation failed",
            "status": 422
        }), 422
    
    @app.errorhandler(429)
    def too_many_requests(error):
        return jsonify({
            "error": "too_many_requests",
            "message": "Rate limit exceeded",
            "status": 429
        }), 429
    
    @app.errorhandler(500)
    def internal_server_error(error):
        app.logger.error(f"Internal server error: {str(error)}")
        return jsonify({
            "error": "internal_server_error",
            "message": "An internal error occurred",
            "status": 500
        }), 500
    
    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        """Handle Pydantic validation errors."""
        return jsonify({
            "error": "validation_error",
            "message": "Validation failed",
            "details": error.errors(),
            "status": 422
        }), 422
    
    @app.errorhandler(IntegrityError)
    def handle_integrity_error(error):
        """Handle database integrity errors."""
        app.logger.error(f"Database integrity error: {str(error)}")
        return jsonify({
            "error": "integrity_error",
            "message": "Data integrity constraint violation",
            "status": 400
        }), 400
    
    @app.errorhandler(DatabaseError)
    def handle_database_error(error):
        """Handle database errors."""
        app.logger.error(f"Database error: {str(error)}")
        return jsonify({
            "error": "database_error",
            "message": "Database operation failed",
            "status": 500
        }), 500
    
    @app.errorhandler(Exception)
    def handle_generic_exception(error):
        """Handle all other exceptions."""
        app.logger.error(f"Unhandled exception: {str(error)}")
        app.logger.error(traceback.format_exc())
        
        if app.debug:
            return jsonify({
                "error": "internal_error",
                "message": str(error),
                "traceback": traceback.format_exc().split('\n'),
                "status": 500
            }), 500
        else:
            return jsonify({
                "error": "internal_error",
                "message": "An unexpected error occurred",
                "status": 500
            }), 500


class APIException(Exception):
    """Custom API exception with status code and message."""
    
    def __init__(self, message: str, status_code: int = 400, error_code: str = None):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code or "api_error"
        super().__init__(message)


def register_api_exception_handler(app):
    """Register handler for custom API exceptions."""
    
    @app.errorhandler(APIException)
    def handle_api_exception(error):
        return jsonify({
            "error": error.error_code,
            "message": error.message,
            "status": error.status_code
        }), error.status_code


def log_request_info():
    """Middleware to log request information."""
    def decorator(f):
        def wrapper(*args, **kwargs):
            app = f.__globals__.get('current_app')
            if app:
                app.logger.info(
                    f"{request.method} {request.path} - "
                    f"IP: {request.remote_addr} - "
                    f"User-Agent: {request.headers.get('User-Agent', 'Unknown')}"
                )
            return f(*args, **kwargs)
        return wrapper
    return decorator