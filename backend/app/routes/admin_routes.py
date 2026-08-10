from flask import Blueprint, request
from app.extensions import db
from app.models.models import User, HRProfile, Company, Job, Application, Report, Category, Location, Skill, AuditLog, Interview, CandidateProfile
from app.utils.helpers import api_response, log_audit, send_notification
from app.middleware.auth import admin_required

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_admin_stats(current_user):
    total_users = User.query.filter_by(role='USER').count()
    total_hrs = User.query.filter_by(role='HR').count()
    pending_hrs = User.query.filter_by(role='HR', status='pending').count()
    total_companies = Company.query.count()
    total_jobs = Job.query.count()
    active_jobs = Job.query.filter_by(status='published').count()
    pending_jobs = Job.query.filter_by(status='pending').count()
    total_applications = Application.query.count()
    total_interviews = Interview.query.count()
    pending_reports = Report.query.filter_by(status='pending').count()

    return api_response(True, "Admin stats fetched", data={
        "total_users": total_users,
        "total_hrs": total_hrs,
        "pending_hrs": pending_hrs,
        "total_companies": total_companies,
        "total_jobs": total_jobs,
        "active_jobs": active_jobs,
        "pending_jobs": pending_jobs,
        "total_applications": total_applications,
        "total_interviews": total_interviews,
        "pending_reports": pending_reports
    })


@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_users(current_user):
    search = request.args.get('search', '').strip()
    status = request.args.get('status', '')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    query = User.query.filter_by(role='USER')
    if search:
        query = query.filter((User.name.ilike(f'%{search}%')) | (User.email.ilike(f'%{search}%')))
    if status:
        query = query.filter_by(status=status)

    pagination = query.order_by(User.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    users_list = []
    for u in pagination.items:
        u_dict = u.to_dict()
        if u.candidate_profile:
            u_dict['candidate_profile'] = u.candidate_profile.to_dict()
        users_list.append(u_dict)

    return api_response(True, "Users list", data={
        "users": users_list,
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page
    })


@admin_bp.route('/users/<int:user_id>/status', methods=['PUT'])
@admin_required
def update_user_status(current_user, user_id):
    data = request.get_json() or {}
    new_status = data.get('status')
    if new_status not in ['active', 'deactivated']:
        return api_response(False, "Invalid status", 400)

    user = User.query.get(user_id)
    if not user or user.role == 'ADMIN':
        return api_response(False, "User not found or cannot modify Admin", 404)

    user.status = new_status
    db.session.commit()

    log_audit(current_user.id, "ADMIN_UPDATE_USER_STATUS", f"Changed status of user {user.email} to {new_status}")
    send_notification(user.id, "Account Status Updated", f"Your account status has been set to '{new_status}' by Admin.", "warning" if new_status == 'deactivated' else "success")

    return api_response(True, f"User status updated to {new_status}", data={"user": user.to_dict()})


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(current_user, user_id):
    user = User.query.get(user_id)
    if not user or user.role == 'ADMIN':
        return api_response(False, "User not found or cannot delete Admin", 404)

    email = user.email
    db.session.delete(user)
    db.session.commit()

    log_audit(current_user.id, "ADMIN_DELETE_USER", f"Deleted user {email}")
    return api_response(True, "User deleted successfully")


@admin_bp.route('/hrs', methods=['GET'])
@admin_required
def get_hrs(current_user):
    status = request.args.get('status', '')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    query = User.query.filter_by(role='HR')
    if status:
        query = query.filter_by(status=status)

    pagination = query.order_by(User.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    hrs_list = []
    for hr in pagination.items:
        hr_dict = hr.to_dict()
        if hr.hr_profile:
            hr_dict['hr_profile'] = hr.hr_profile.to_dict()
        hrs_list.append(hr_dict)

    return api_response(True, "HR accounts list", data={
        "hrs": hrs_list,
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page
    })


@admin_bp.route('/hrs/<int:hr_id>/approve', methods=['PUT'])
@admin_required
def approve_hr(current_user, hr_id):
    hr = User.query.filter_by(id=hr_id, role='HR').first()
    if not hr:
        return api_response(False, "HR account not found", 404)

    hr.status = 'active'
    db.session.commit()

    log_audit(current_user.id, "ADMIN_APPROVE_HR", f"Approved HR account {hr.email}")
    send_notification(hr.id, "HR Account Approved", "Congratulations! Your HR account has been approved by the Admin. You can now post jobs and manage recruitment.", "success")

    return api_response(True, "HR account approved successfully", data={"hr": hr.to_dict()})


@admin_bp.route('/hrs/<int:hr_id>/reject', methods=['PUT'])
@admin_required
def reject_hr(current_user, hr_id):
    hr = User.query.filter_by(id=hr_id, role='HR').first()
    if not hr:
        return api_response(False, "HR account not found", 404)

    hr.status = 'rejected'
    db.session.commit()

    log_audit(current_user.id, "ADMIN_REJECT_HR", f"Rejected HR account {hr.email}")
    send_notification(hr.id, "HR Registration Update", "Your HR registration request has been reviewed and rejected by the Admin.", "alert")

    return api_response(True, "HR account rejected", data={"hr": hr.to_dict()})


@admin_bp.route('/hrs/<int:hr_id>/status', methods=['PUT'])
@admin_required
def toggle_hr_status(current_user, hr_id):
    data = request.get_json() or {}
    new_status = data.get('status')
    if new_status not in ['active', 'deactivated', 'pending']:
        return api_response(False, "Invalid status", 400)

    hr = User.query.filter_by(id=hr_id, role='HR').first()
    if not hr:
        return api_response(False, "HR account not found", 404)

    hr.status = new_status
    db.session.commit()

    log_audit(current_user.id, "ADMIN_TOGGLE_HR_STATUS", f"Changed status of HR {hr.email} to {new_status}")
    send_notification(hr.id, "Account Status Updated", f"Your HR account status is now set to '{new_status}'.", "info")

    return api_response(True, f"HR status updated to {new_status}", data={"hr": hr.to_dict()})


@admin_bp.route('/jobs', methods=['GET'])
@admin_required
def get_admin_jobs(current_user):
    status = request.args.get('status', '')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    query = Job.query
    if status:
        query = query.filter_by(status=status)

    pagination = query.order_by(Job.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    return api_response(True, "Admin jobs list", data={
        "jobs": [j.to_dict() for j in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page
    })


@admin_bp.route('/jobs/<int:job_id>/approve', methods=['PUT'])
@admin_required
def approve_job(current_user, job_id):
    job = Job.query.get(job_id)
    if not job:
        return api_response(False, "Job not found", 404)

    job.status = 'published'
    db.session.commit()

    log_audit(current_user.id, "ADMIN_APPROVE_JOB", f"Approved job posting '{job.title}' (ID: {job.id})")
    send_notification(job.hr_id, "Job Posting Approved", f"Your job posting '{job.title}' has been approved by Admin and is now live!", "success")

    return api_response(True, "Job approved successfully", data={"job": job.to_dict()})


@admin_bp.route('/jobs/<int:job_id>/reject', methods=['PUT'])
@admin_required
def reject_job(current_user, job_id):
    job = Job.query.get(job_id)
    if not job:
        return api_response(False, "Job not found", 404)

    job.status = 'rejected'
    db.session.commit()

    log_audit(current_user.id, "ADMIN_REJECT_JOB", f"Rejected job posting '{job.title}' (ID: {job.id})")
    send_notification(job.hr_id, "Job Posting Rejected", f"Your job posting '{job.title}' was reviewed and rejected by Admin.", "alert")

    return api_response(True, "Job posting rejected", data={"job": job.to_dict()})


@admin_bp.route('/jobs/<int:job_id>', methods=['DELETE'])
@admin_required
def delete_admin_job(current_user, job_id):
    job = Job.query.get(job_id)
    if not job:
        return api_response(False, "Job not found", 404)

    title = job.title
    db.session.delete(job)
    db.session.commit()

    log_audit(current_user.id, "ADMIN_DELETE_JOB", f"Deleted job posting '{title}' (ID: {job_id})")
    return api_response(True, "Job deleted successfully")


@admin_bp.route('/applications', methods=['GET'])
@admin_required
def get_all_applications(current_user):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    pagination = Application.query.order_by(Application.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    return api_response(True, "Applications list", data={
        "applications": [a.to_dict() for a in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page
    })


@admin_bp.route('/reports', methods=['GET'])
@admin_required
def get_reports(current_user):
    reports = Report.query.order_by(Report.created_at.desc()).all()
    return api_response(True, "Reports list", data={"reports": [r.to_dict() for r in reports]})


@admin_bp.route('/reports/<int:report_id>/action', methods=['PUT'])
@admin_required
def action_report(current_user, report_id):
    data = request.get_json() or {}
    action = data.get('action') # resolve, dismiss, suspend_job, suspend_hr

    report = Report.query.get(report_id)
    if not report:
        return api_response(False, "Report not found", 404)

    if action == 'resolve':
        report.status = 'resolved'
    elif action == 'dismiss':
        report.status = 'dismissed'
    elif action == 'suspend_job' and report.job_id:
        job = Job.query.get(report.job_id)
        if job:
            job.status = 'closed'
            send_notification(job.hr_id, "Job Suspended", f"Your job '{job.title}' was suspended due to a user report.", "alert")
        report.status = 'resolved'
    elif action == 'suspend_hr' and report.hr_id:
        hr = User.query.get(report.hr_id)
        if hr:
            hr.status = 'deactivated'
            send_notification(hr.id, "Account Suspended", "Your HR account has been suspended due to policy violations.", "alert")
        report.status = 'resolved'

    db.session.commit()
    log_audit(current_user.id, "ADMIN_REPORT_ACTION", f"Took action '{action}' on report #{report_id}")
    return api_response(True, "Report updated successfully", data={"report": report.to_dict()})


@admin_bp.route('/categories', methods=['GET', 'POST'])
@admin_required
def manage_categories(current_user):
    if request.method == 'POST':
        data = request.get_json() or {}
        name = data.get('name')
        if not name:
            return api_response(False, "Category name required", 400)
        cat = Category(name=name, description=data.get('description'), icon=data.get('icon'))
        db.session.add(cat)
        db.session.commit()
        log_audit(current_user.id, "CREATE_CATEGORY", f"Created category '{name}'")
        return api_response(True, "Category created", data={"category": cat.to_dict()}, status_code=201)

    categories = Category.query.all()
    return api_response(True, "Categories list", data={"categories": [c.to_dict() for c in categories]})


@admin_bp.route('/categories/<int:cat_id>', methods=['DELETE'])
@admin_required
def delete_category(current_user, cat_id):
    cat = Category.query.get(cat_id)
    if not cat:
        return api_response(False, "Category not found", 404)
    db.session.delete(cat)
    db.session.commit()
    log_audit(current_user.id, "DELETE_CATEGORY", f"Deleted category #{cat_id}")
    return api_response(True, "Category deleted")


@admin_bp.route('/locations', methods=['GET', 'POST'])
@admin_required
def manage_locations(current_user):
    if request.method == 'POST':
        data = request.get_json() or {}
        city = data.get('city')
        if not city:
            return api_response(False, "City required", 400)
        loc = Location(city=city, state=data.get('state'), country=data.get('country', 'India'))
        db.session.add(loc)
        db.session.commit()
        log_audit(current_user.id, "CREATE_LOCATION", f"Created location '{city}'")
        return api_response(True, "Location created", data={"location": loc.to_dict()}, status_code=201)

    locations = Location.query.all()
    return api_response(True, "Locations list", data={"locations": [l.to_dict() for l in locations]})


@admin_bp.route('/locations/<int:loc_id>', methods=['DELETE'])
@admin_required
def delete_location(current_user, loc_id):
    loc = Location.query.get(loc_id)
    if not loc:
        return api_response(False, "Location not found", 404)
    db.session.delete(loc)
    db.session.commit()
    log_audit(current_user.id, "DELETE_LOCATION", f"Deleted location #{loc_id}")
    return api_response(True, "Location deleted")


@admin_bp.route('/skills', methods=['GET', 'POST'])
@admin_required
def manage_skills(current_user):
    if request.method == 'POST':
        data = request.get_json() or {}
        name = data.get('name')
        if not name:
            return api_response(False, "Skill name required", 400)
        skill = Skill(name=name, category=data.get('category'))
        db.session.add(skill)
        db.session.commit()
        log_audit(current_user.id, "CREATE_SKILL", f"Created skill '{name}'")
        return api_response(True, "Skill created", data={"skill": skill.to_dict()}, status_code=201)

    skills = Skill.query.all()
    return api_response(True, "Skills list", data={"skills": [s.to_dict() for s in skills]})


@admin_bp.route('/skills/<int:skill_id>', methods=['DELETE'])
@admin_required
def delete_skill(current_user, skill_id):
    skill = Skill.query.get(skill_id)
    if not skill:
        return api_response(False, "Skill not found", 404)
    db.session.delete(skill)
    db.session.commit()
    log_audit(current_user.id, "DELETE_SKILL", f"Deleted skill #{skill_id}")
    return api_response(True, "Skill deleted")


@admin_bp.route('/audit-logs', methods=['GET'])
@admin_required
def get_audit_logs(current_user):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    pagination = AuditLog.query.order_by(AuditLog.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    return api_response(True, "Audit logs", data={
        "logs": [log.to_dict() for log in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page
    })
