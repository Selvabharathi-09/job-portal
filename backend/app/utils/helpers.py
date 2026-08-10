import os
import uuid
from flask import jsonify, current_app, request
from werkzeug.utils import secure_filename
from app.extensions import db
from app.models.models import AuditLog, Notification

def api_response(success=True, message="", data=None, status_code=200):
    response = {
        "success": success,
        "message": message,
        "data": data
    }
    return jsonify(response), status_code

def log_audit(user_id, action, details=None):
    try:
        ip = request.remote_addr if request else "127.0.0.1"
        audit = AuditLog(
            user_id=user_id,
            action=action,
            details=str(details) if details else None,
            ip_address=ip
        )
        db.session.add(audit)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Error logging audit: {e}")

def send_notification(user_id, title, message, notif_type='info'):
    try:
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notif_type
        )
        db.session.add(notif)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Error sending notification: {e}")

def save_uploaded_file(file, folder_name):
    if not file or file.filename == '':
        return None
    
    filename = secure_filename(file.filename)
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    
    if folder_name == 'photos' or folder_name == 'logos':
        if ext not in current_app.config['ALLOWED_IMAGE_EXTENSIONS']:
            return None
    elif folder_name == 'resumes':
        if ext not in current_app.config['ALLOWED_RESUME_EXTENSIONS']:
            return None
    else:
        return None

    unique_filename = f"{uuid.uuid4().hex}_{filename}"
    target_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], folder_name)
    os.makedirs(target_dir, exist_ok=True)
    
    file_path = os.path.join(target_dir, unique_filename)
    file.save(file_path)
    
    # Return relative web path
    return f"/uploads/{folder_name}/{unique_filename}"
