from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity
from app import db
from app.models import Notification
from app.utils import role_required

notification_bp = Blueprint("notification_bp", __name__)


@notification_bp.route("/api/notifications", methods=["GET"])
@role_required("admin", "agent", "customer")
def get_notifications():
    user_id = int(get_jwt_identity())
    notifications = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).limit(20).all()
    result = [{
        "id": n.id, "message": n.message, "notif_type": n.notif_type,
        "is_read": n.is_read, "created_at": str(n.created_at)
    } for n in notifications]
    unread_count = Notification.query.filter_by(user_id=user_id, is_read=False).count()
    return jsonify({"notifications": result, "unread_count": unread_count}), 200


@notification_bp.route("/api/notifications/mark-read", methods=["PUT"])
@role_required("admin", "agent", "customer")
def mark_all_read():
    user_id = int(get_jwt_identity())
    Notification.query.filter_by(user_id=user_id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"message": "Notifications marked as read"}), 200