from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.models import User
from app.utils.helpers import api_response

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            current_user = User.query.get(user_id)
            if not current_user:
                return api_response(False, "User not found or session expired", status_code=401)
            if current_user.status == 'deactivated':
                return api_response(False, "Your account has been deactivated", status_code=403)
            return f(current_user, *args, **kwargs)
        except Exception as e:
            return api_response(False, f"Authentication required: {str(e)}", status_code=401)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            current_user = User.query.get(user_id)
            if not current_user or current_user.role != 'ADMIN':
                return api_response(False, "Access denied: Admin privileges required", status_code=403)
            return f(current_user, *args, **kwargs)
        except Exception as e:
            return api_response(False, "Authentication required", status_code=401)
    return decorated

def hr_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            current_user = User.query.get(user_id)
            if not current_user or current_user.role != 'HR':
                return api_response(False, "Access denied: HR privileges required", status_code=403)
            return f(current_user, *args, **kwargs)
        except Exception as e:
            return api_response(False, "Authentication required", status_code=401)
    return decorated

def approved_hr_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            current_user = User.query.get(user_id)
            if not current_user or current_user.role != 'HR':
                return api_response(False, "Access denied: HR privileges required", status_code=403)
            if current_user.status == 'pending':
                return api_response(False, "Your HR account is waiting for Admin approval.", status_code=403)
            if current_user.status == 'rejected':
                return api_response(False, "Your HR registration has been rejected.", status_code=403)
            if current_user.status == 'deactivated':
                return api_response(False, "Your HR account has been suspended.", status_code=403)
            return f(current_user, *args, **kwargs)
        except Exception as e:
            return api_response(False, "Authentication required", status_code=401)
    return decorated

def user_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            current_user = User.query.get(user_id)
            if not current_user or current_user.role != 'USER':
                return api_response(False, "Access denied: Candidate account required", status_code=403)
            if current_user.status != 'active':
                return api_response(False, "Your account is not active", status_code=403)
            return f(current_user, *args, **kwargs)
        except Exception as e:
            return api_response(False, "Authentication required", status_code=401)
    return decorated
