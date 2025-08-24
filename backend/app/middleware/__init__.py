"""Middleware package for security, error handling, and other cross-cutting concerns."""

from .decorators import login_required, admin_required, get_current_user
from .security import (
    rate_limit, validate_input_size, sanitize_input, 
    security_headers, validate_content_type, detect_suspicious_activity
)
from .error_handlers import (
    register_error_handlers, register_api_exception_handler,
    APIException, log_request_info
)

# Export all middleware components
__all__ = [
    # Decorators
    'login_required', 'admin_required', 'get_current_user',
    
    # Security middleware
    'rate_limit', 'validate_input_size', 'sanitize_input',
    'security_headers', 'validate_content_type', 'detect_suspicious_activity',
    
    # Error handling
    'register_error_handlers', 'register_api_exception_handler',
    'APIException', 'log_request_info',
]