"""Security middleware for rate limiting, CORS, and other security features."""

import time
from collections import defaultdict
from typing import Dict, List
from flask import request, jsonify, g
from functools import wraps
import re


class RateLimiter:
    """Simple in-memory rate limiter."""
    
    def __init__(self):
        self.requests: Dict[str, List[float]] = defaultdict(list)
        self.blocked_ips: Dict[str, float] = {}
    
    def is_allowed(self, key: str, limit: int, window: int) -> bool:
        """Check if request is within rate limit."""
        now = time.time()
        
        # Check if IP is temporarily blocked
        if key in self.blocked_ips:
            if now - self.blocked_ips[key] < 300:  # 5 minute block
                return False
            else:
                del self.blocked_ips[key]
        
        # Clean old requests outside the window
        self.requests[key] = [req_time for req_time in self.requests[key] 
                             if now - req_time < window]
        
        # Check if within limit
        if len(self.requests[key]) >= limit:
            # Block IP for repeated violations
            if len(self.requests[key]) >= limit * 2:
                self.blocked_ips[key] = now
            return False
        
        # Add current request
        self.requests[key].append(now)
        return True
    
    def get_remaining(self, key: str, limit: int, window: int) -> int:
        """Get remaining requests in current window."""
        now = time.time()
        recent_requests = [req_time for req_time in self.requests[key] 
                          if now - req_time < window]
        return max(0, limit - len(recent_requests))


# Global rate limiter instance
rate_limiter = RateLimiter()


def rate_limit(limit: int = 100, window: int = 3600, per: str = "ip"):
    """Rate limiting decorator.
    
    Args:
        limit: Number of requests allowed
        window: Time window in seconds
        per: Rate limit per 'ip' or 'user'
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if per == "ip":
                key = f"ip:{request.remote_addr}"
            elif per == "user":
                user_id = getattr(g, 'user_id', None)
                if not user_id:
                    key = f"ip:{request.remote_addr}"
                else:
                    key = f"user:{user_id}"
            else:
                key = f"ip:{request.remote_addr}"
            
            if not rate_limiter.is_allowed(key, limit, window):
                return jsonify({
                    "message": "Rate limit exceeded. Please try again later.",
                    "error": "too_many_requests"
                }), 429
            
            return f(*args, **kwargs)
        return wrapper
    return decorator


def validate_input_size():
    """Middleware to validate request size."""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if request.content_length and request.content_length > 16 * 1024 * 1024:  # 16MB
                return jsonify({
                    "message": "Request too large",
                    "error": "payload_too_large"
                }), 413
            return f(*args, **kwargs)
        return wrapper
    return decorator


def sanitize_input():
    """Basic input sanitization middleware."""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if request.is_json and request.json:
                sanitized_data = _sanitize_dict(request.json)
                request.json = sanitized_data
            return f(*args, **kwargs)
        return wrapper
    return decorator


def _sanitize_dict(data):
    """Recursively sanitize dictionary data."""
    if isinstance(data, dict):
        return {key: _sanitize_dict(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [_sanitize_dict(item) for item in data]
    elif isinstance(data, str):
        return _sanitize_string(data)
    else:
        return data


def _sanitize_string(value: str) -> str:
    """Sanitize string input."""
    if not isinstance(value, str):
        return value
    
    # Remove potential XSS patterns
    xss_patterns = [
        r'<script.*?>.*?</script>',
        r'javascript:',
        r'on\w+\s*=',
        r'<iframe.*?>.*?</iframe>',
    ]
    
    for pattern in xss_patterns:
        value = re.sub(pattern, '', value, flags=re.IGNORECASE | re.DOTALL)
    
    return value.strip()


def security_headers():
    """Add security headers to responses."""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            response = f(*args, **kwargs)
            
            # Convert to Response object if needed
            if not hasattr(response, 'headers'):
                from flask import make_response
                response = make_response(response)
            
            # Add security headers
            response.headers['X-Content-Type-Options'] = 'nosniff'
            response.headers['X-Frame-Options'] = 'DENY'
            response.headers['X-XSS-Protection'] = '1; mode=block'
            response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
            
            # Only add HSTS in production
            if not response.get_json() and not request.environ.get('DEBUG'):
                response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
            
            return response
        return wrapper
    return decorator


def validate_content_type(allowed_types: List[str]):
    """Validate request content type."""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if request.method in ['POST', 'PUT', 'PATCH']:
                content_type = request.content_type or ''
                if not any(allowed_type in content_type for allowed_type in allowed_types):
                    return jsonify({
                        "message": "Invalid content type",
                        "error": "invalid_content_type"
                    }), 400
            return f(*args, **kwargs)
        return wrapper
    return decorator


def detect_suspicious_activity():
    """Detect and log suspicious activity."""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            # Check for suspicious patterns
            suspicious_patterns = [
                'union select',
                'drop table',
                '../',
                '<script>',
                'javascript:',
                'eval(',
            ]
            
            # Check query parameters
            for key, value in request.args.items():
                if any(pattern in str(value).lower() for pattern in suspicious_patterns):
                    # Log suspicious activity (implement logging)
                    return jsonify({
                        "message": "Suspicious activity detected",
                        "error": "suspicious_request"
                    }), 400
            
            # Check JSON data
            if request.is_json and request.json:
                json_str = str(request.json).lower()
                if any(pattern in json_str for pattern in suspicious_patterns):
                    return jsonify({
                        "message": "Suspicious activity detected",
                        "error": "suspicious_request"
                    }), 400
            
            return f(*args, **kwargs)
        return wrapper
    return decorator