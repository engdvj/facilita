"""Logging configuration for the application."""

import logging
import logging.config
import os
import sys
from datetime import datetime
from pathlib import Path
import json


class JSONFormatter(logging.Formatter):
    """JSON formatter for structured logging."""
    
    def format(self, record):
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
        }
        
        # Add exception info if present
        if record.exc_info:
            log_entry['exception'] = self.formatException(record.exc_info)
        
        # Add extra fields
        for key, value in record.__dict__.items():
            if key not in ['name', 'msg', 'args', 'levelname', 'levelno', 
                          'pathname', 'filename', 'module', 'lineno', 
                          'funcName', 'created', 'msecs', 'relativeCreated', 
                          'thread', 'threadName', 'processName', 'process',
                          'message', 'exc_info', 'exc_text', 'stack_info']:
                log_entry[key] = value
        
        return json.dumps(log_entry)


def setup_logging(app):
    """Setup logging configuration for the Flask app."""
    
    # Create logs directory
    log_dir = Path(app.root_path).parent.parent / 'logs'
    log_dir.mkdir(exist_ok=True)
    
    # Determine log level from environment
    log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
    debug_mode = app.config.get('DEBUG', False)
    
    if debug_mode:
        log_level = 'DEBUG'
    
    # Configure logging
    logging_config = {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'standard': {
                'format': '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
            },
            'json': {
                '()': JSONFormatter,
            },
            'detailed': {
                'format': '[%(asctime)s] %(levelname)s [%(name)s:%(lineno)s] %(message)s'
            }
        },
        'handlers': {
            'console': {
                'class': 'logging.StreamHandler',
                'level': log_level,
                'formatter': 'standard' if debug_mode else 'json',
                'stream': sys.stdout
            },
            'file_info': {
                'class': 'logging.handlers.RotatingFileHandler',
                'level': 'INFO',
                'formatter': 'json',
                'filename': str(log_dir / 'app.log'),
                'maxBytes': 10 * 1024 * 1024,  # 10MB
                'backupCount': 5
            },
            'file_error': {
                'class': 'logging.handlers.RotatingFileHandler',
                'level': 'ERROR',
                'formatter': 'detailed',
                'filename': str(log_dir / 'error.log'),
                'maxBytes': 10 * 1024 * 1024,  # 10MB
                'backupCount': 5
            }
        },
        'loggers': {
            '': {  # Root logger
                'level': log_level,
                'handlers': ['console', 'file_info', 'file_error'],
                'propagate': False
            },
            'sqlalchemy.engine': {
                'level': 'WARNING' if not debug_mode else 'INFO',
                'handlers': ['console'],
                'propagate': False
            },
            'werkzeug': {
                'level': 'WARNING' if not debug_mode else 'INFO',
                'handlers': ['console'],
                'propagate': False
            }
        }
    }
    
    logging.config.dictConfig(logging_config)
    
    # Get the app logger
    app_logger = logging.getLogger('facilita')
    app_logger.info('Logging configured successfully', extra={
        'log_level': log_level,
        'debug_mode': debug_mode,
        'log_directory': str(log_dir)
    })
    
    return app_logger


def get_logger(name):
    """Get a logger instance with the specified name."""
    return logging.getLogger(f'facilita.{name}')


class RequestLogger:
    """Middleware to log HTTP requests."""
    
    def __init__(self, app=None):
        self.app = app
        self.logger = get_logger('requests')
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize with Flask app."""
        app.before_request(self.log_request)
        app.after_request(self.log_response)
    
    def log_request(self):
        """Log incoming request."""
        from flask import request, g
        
        g.start_time = datetime.utcnow()
        
        self.logger.info('Request started', extra={
            'method': request.method,
            'path': request.path,
            'query_string': request.query_string.decode(),
            'remote_addr': request.remote_addr,
            'user_agent': request.headers.get('User-Agent', ''),
            'content_type': request.headers.get('Content-Type', ''),
            'content_length': request.headers.get('Content-Length', 0)
        })
    
    def log_response(self, response):
        """Log outgoing response."""
        from flask import g
        
        if hasattr(g, 'start_time'):
            duration = (datetime.utcnow() - g.start_time).total_seconds()
        else:
            duration = 0
        
        self.logger.info('Request completed', extra={
            'status_code': response.status_code,
            'duration_seconds': duration,
            'response_size': len(response.get_data())
        })
        
        return response


def log_user_activity(user_id, action, details=None):
    """Log user activity for audit purposes."""
    logger = get_logger('audit')
    
    logger.info('User activity', extra={
        'user_id': user_id,
        'action': action,
        'details': details or {},
        'timestamp': datetime.utcnow().isoformat()
    })


def log_security_event(event_type, details=None, severity='INFO'):
    """Log security-related events."""
    logger = get_logger('security')
    
    log_method = getattr(logger, severity.lower(), logger.info)
    
    log_method('Security event', extra={
        'event_type': event_type,
        'details': details or {},
        'severity': severity,
        'timestamp': datetime.utcnow().isoformat()
    })


def log_database_operation(operation, table, record_id=None, details=None):
    """Log database operations for audit trail."""
    logger = get_logger('database')
    
    logger.info('Database operation', extra={
        'operation': operation,
        'table': table,
        'record_id': record_id,
        'details': details or {},
        'timestamp': datetime.utcnow().isoformat()
    })