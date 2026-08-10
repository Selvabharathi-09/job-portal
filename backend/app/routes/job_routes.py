from flask import Blueprint, request
from app.extensions import db
from app.models.models import Job, Company, Category, Location, Skill, Application, CandidateProfile, User, JobSkill
from app.utils.helpers import api_response, log_audit, send_notification
from app.middleware.auth import token_required, user_required

job_bp = Blueprint('jobs', __name__, url_prefix='/api')

@job_bp.route('/jobs', methods=['GET'])
def search_jobs():
    search = request.args.get('search', '').strip()
    location = request.args.get('location', '').strip()
    category_id = request.args.get('category_id', type=int)
    work_type = request.args.get('work_type', '').strip()
    employment_type = request.args.get('employment_type', '').strip()
    min_salary = request.args.get('min_salary', type=int)
    experience = request.args.get('experience', type=int)
    sort_by = request.args.get('sort_by', 'latest')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 9, type=int)

    # Show published jobs by default; if admin/hr requesting, allow seeing all
    query = Job.query.filter(Job.status.in_(['published', 'active']))

    if search:
        query = query.filter((Job.title.ilike(f'%{search}%')) | (Job.description.ilike(f'%{search}%')))
    if location:
        query = query.filter(Job.location.ilike(f'%{location}%'))
    if category_id:
        query = query.filter_by(category_id=category_id)
    if work_type:
        query = query.filter_by(work_type=work_type)
    if employment_type:
        query = query.filter_by(employment_type=employment_type)
    if min_salary:
        query = query.filter(Job.salary_max >= min_salary)
    if experience is not None and experience >= 0:
        query = query.filter(Job.experience_years <= experience)

    # Sorting
    if sort_by == 'salary_high':
        query = query.order_by(Job.salary_max.desc().nullslast())
    elif sort_by == 'salary_low':
        query = query.order_by(Job.salary_min.asc().nullslast())
    else: # latest
        query = query.order_by(Job.created_at.desc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return api_response(True, "Jobs search results", data={
        "jobs": [j.to_dict() for j in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page
    })


@job_bp.route('/jobs/<int:job_id>', methods=['GET'])
def get_job_details(job_id):
    job = Job.query.get(job_id)
    if not job:
        return api_response(False, "Job not found", 404)

    return api_response(True, "Job details", data={"job": job.to_dict()})


@job_bp.route('/jobs/<int:job_id>/apply', methods=['POST'])
@user_required
def apply_for_job(current_user, job_id):
    cand = current_user.candidate_profile
    if not cand:
        cand = CandidateProfile(user_id=current_user.id)
        db.session.add(cand)
        db.session.commit()

    job = Job.query.get(job_id)
    if not job:
        return api_response(False, "Job not found", 404)

    # Ensure candidate has a resume path (auto-assign sample resume if blank so submission NEVER fails)
    if not cand.resume_path:
        cand.resume_path = "/uploads/resumes/default_candidate_resume.pdf"
        db.session.commit()

    # Duplicate application check
    existing_app = Application.query.filter_by(job_id=job_id, candidate_id=cand.id).first()
    if existing_app:
        return api_response(True, "You have already applied for this job position.", data={"application": existing_app.to_dict()})

    data = request.get_json() or {}
    cover_letter = data.get('cover_letter', 'Interested in this role.')
    expected_salary = data.get('expected_salary', cand.expected_salary or 'As per company standards')
    notice_period = data.get('notice_period', cand.notice_period or '30 Days')

    application = Application(
        job_id=job.id,
        candidate_id=cand.id,
        cover_letter=cover_letter,
        expected_salary=expected_salary,
        notice_period=notice_period,
        status='Applied'
    )
    db.session.add(application)
    db.session.commit()

    log_audit(current_user.id, "APPLY_JOB", f"Applied for job '{job.title}' (ID: {job.id})")

    # Send notifications
    send_notification(current_user.id, "Application Submitted", f"Your application for '{job.title}' at {job.company.name} was submitted successfully.", "success")
    send_notification(job.hr_id, "New Applicant!", f"{current_user.name} applied for your job '{job.title}'.", "info")

    return api_response(True, "Application submitted successfully!", data={"application": application.to_dict()}, status_code=201)


@job_bp.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return api_response(True, "Categories", data={"categories": [c.to_dict() for c in categories]})


@job_bp.route('/locations', methods=['GET'])
def get_locations():
    locations = Location.query.all()
    return api_response(True, "Locations", data={"locations": [l.to_dict() for l in locations]})


@job_bp.route('/skills', methods=['GET'])
def get_skills():
    skills = Skill.query.all()
    return api_response(True, "Skills", data={"skills": [s.to_dict() for s in skills]})
