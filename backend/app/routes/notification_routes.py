from flask import Blueprint, request
from app.extensions import db
from app.models.models import Notification
from app.utils.helpers import api_response
from app.middleware.auth import token_required

notif_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

@notif_bp.route('', methods=['GET'])
@token_required
def get_user_notifications(current_user):
    notifications = Notification.query.filter_by(user_id=current_user.id).order_by(Notification.created_at.desc()).all()
    unread_count = Notification.query.filter_by(user_id=current_user.id, is_read=False).count()
    return api_response(True, "Notifications list", data={
        "notifications": [n.to_dict() for n in notifications],
        "unread_count": unread_count
    })

@notif_bp.route('/<int:notif_id>/read', methods=['PUT'])
@token_required
def mark_notification_read(current_user, notif_id):
    notif = Notification.query.filter_by(id=notif_id, user_id=current_user.id).first()
    if notif:
        notif.is_read = True
        db.session.commit()
    return api_response(True, "Notification marked as read")

@notif_bp.route('/read-all', methods=['PUT'])
@token_required
def mark_all_notifications_read(current_user):
    Notification.query.filter_by(user_id=current_user.id, is_read=False).update({Notification.is_read: True})
    db.session.commit()
    return api_response(True, "All notifications marked as read")
