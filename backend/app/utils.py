from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from app.models import Notification, User

def role_required(*allowed_roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = claims.get("role")

            if user_role not in allowed_roles:
                return jsonify({"error": "You do not have permission to perform this action"}), 403

            return fn(*args, **kwargs)
        return wrapper
    return decorator

def notify(user_id, message, notif_type):
    from app import db
    n = Notification(user_id=user_id, message=message, notif_type=notif_type)
    db.session.add(n)
    db.session.commit()

def notify_all_staff(message, notif_type):
    from app import db
    staff = User.query.filter(User.role.in_(["admin", "agent"])).all()
    for s in staff:
        db.session.add(Notification(user_id=s.id, message=message, notif_type=notif_type))
    db.session.commit()