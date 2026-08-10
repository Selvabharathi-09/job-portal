from flask import Blueprint, request
from flask_jwt_extended import create_access_token
from app.extensions import db
from app.models.models import User, HRProfile, CandidateProfile, Company
from app.utils.helpers import api_response, log_audit, save_uploaded_file, send_notification
from app.middleware.auth import token_required

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.form if request.form else (request.get_json() or {})
    
    name = data.get('name')
    email = data.get('email', '').strip().lower()
    password = data.get('password')
    role = data.get('role', 'USER').upper()

    if not name or not email or not password:
        return api_response(False, "Name, email, and password are required", status_code=400)

    # Strictly enforce single Admin policy
    if role == 'ADMIN':
        return api_response(False, "Super Admin accounts cannot be created via public registration", status_code=400)

    if role not in ['HR', 'USER']:
        return api_response(False, "Invalid user role specified", status_code=400)

    # Check if user email already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return api_response(False, "An account with this email address already exists", status_code=409)

    # Set both HR and USER status to 'active' for immediate full access
    status = 'active'

    user = User(
        name=name,
        email=email,
        role=role,
        status=status
    )
    user.set_password(password)

    db.session.add(user)
    db.session.flush() # get user.id

    if role == 'HR':
        company_name = data.get('company_name', f"{name}'s Company")
        company = Company.query.filter_by(name=company_name).first()
        if not company:
            company = Company(
                name=company_name,
                location=data.get('company_location', ''),
                industry=data.get('industry', ''),
                website=data.get('company_website', ''),
                description=data.get('company_description', '')
            )
            db.session.add(company)
            db.session.flush()
        
        hr_prof = HRProfile(user_id=user.id, company_id=company.id, phone=data.get('phone'))
        db.session.add(hr_prof)

        send_notification(user.id, "Welcome Recruiter!", "Your HR account is active. You can now post jobs and manage recruitment.", "success")
        admins = User.query.filter_by(role='ADMIN').all()
        for admin in admins:
            send_notification(admin.id, "New HR Registration", f"HR {name} ({company_name}) has registered.", "info")

    elif role == 'USER':
        cand_prof = CandidateProfile(
            user_id=user.id,
            phone=data.get('phone', ''),
            location=data.get('location', ''),
            resume_path="/uploads/resumes/default_candidate_resume.pdf"
        )
        db.session.add(cand_prof)
        send_notification(user.id, "Welcome to JobPortal!", "Your account was created successfully. You can now explore and apply for jobs.", "success")

    db.session.commit()

    log_audit(user.id, "USER_REGISTER", f"Registered new {role} account ({email})")

    return api_response(True, "Registration successful! You can now log in.", data={"user": user.to_dict()}, status_code=201)


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password')

    if not email or not password:
        return api_response(False, "Email and password are required", status_code=400)

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return api_response(False, "Invalid email or password", status_code=401)

    if user.status == 'deactivated':
        return api_response(False, "Your account has been deactivated. Please contact support.", status_code=403)

    access_token = create_access_token(identity=str(user.id))

    log_audit(user.id, "USER_LOGIN", f"Logged in successfully as {user.role}")

    return api_response(True, "Login successful", data={
        "token": access_token,
        "user": user.to_dict(),
        "redirect": f"/{user.role.lower()}/dashboard"
    })


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    user_data = current_user.to_dict()
    if current_user.role == 'HR' and current_user.hr_profile:
        user_data['hr_profile'] = current_user.hr_profile.to_dict()
    elif current_user.role == 'USER' and current_user.candidate_profile:
        user_data['candidate_profile'] = current_user.candidate_profile.to_dict()

    return api_response(True, "User data retrieved", data={"user": user_data})


@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    log_audit(current_user.id, "USER_LOGOUT", "User logged out")
    return api_response(True, "Logged out successfully")


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        return api_response(True, "If the email is registered, password reset instructions have been sent.")
    
    log_audit(user.id, "PASSWORD_RESET_REQUEST", "Requested password reset link")
    return api_response(True, "If the email is registered, password reset instructions have been sent.")
