def validate_required_fields(data, required_fields):
    """Validate that all required fields are present in the data."""
    missing_fields = []
    for field in required_fields:
        if field not in data or not data[field]:
            missing_fields.append(field)
    
    if missing_fields:
        return False, f"Missing required fields: {', '.join(missing_fields)}"
    
    return True, None


def clean_payload(payload, allowed_fields):
    """Remove fields that are not allowed from the payload."""
    cleaned = {}
    for field in allowed_fields:
        if field in payload:
            cleaned[field] = payload[field]
    return cleaned


def handle_nullable_fields(payload, nullable_fields):
    """Remove fields with None values from payload."""
    for field in nullable_fields:
        if field in payload and payload[field] is None:
            del payload[field]
    return payload