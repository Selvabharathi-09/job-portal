from flask import Blueprint, request
from app.extensions import db
from app.models.models import User, CandidateProfile, Education, Experience, Project, Skill, CandidateSkill, Application, SavedJob, Interview, Report, Job
from app.utils.helpers import api_response, log_audit, save_uploaded_file, send_notification
from app.middleware.auth import user_required

user_bp = Blueprint('user', __name__, url_prefix='/api/user')

@user_bp.route('/dashboard', methods=['GET'])
@user_required
def get_user_dashboard(current_user):
    cand = current_user.candidate_profile
    if not cand:
        return api_response(True, "Candidate dashboard", data={
            "total_applications": 0, "shortlisted": 0, "interviews": 0, "saved_jobs": 0
        })

    applications = Application.query.filter_by(candidate_id=cand.id).all()
    total_applications = len(applications)
    shortlisted = len([a for a in applications if a.status in ['Shortlisted', 'Selected']])
    interviews = Interview.query.filter_by(candidate_id=current_user.id).count()
    saved_jobs = SavedJob.query.filter_by(user_id=current_user.id).count()

    return api_response(True, "Candidate dashboard stats", data={
        "total_applications": total_applications,
        "shortlisted": shortlisted,
        "interviews": interviews,
        "saved_jobs": saved_jobs
    })


@user_bp.route('/profile', methods=['GET', 'PUT'])
@user_required
def candidate_profile_api(current_user):
    cand = current_user.candidate_profile
    if not cand:
        cand = CandidateProfile(user_id=current_user.id)
        db.session.add(cand)
        db.session.commit()

    if request.method == 'PUT':
        data = request.form if request.form else (request.get_json() or {})
        
        current_user.name = data.get('name', current_user.name)
        cand.phone = data.get('phone', cand.phone)
        cand.location = data.get('location', cand.location)
        cand.dob = data.get('dob', cand.dob)
        cand.about = data.get('about', cand.about)
        cand.expected_salary = data.get('expected_salary', cand.expected_salary)
        cand.notice_period = data.get('notice_period', cand.notice_period)

        if 'profile_photo' in request.files:
            photo_path = save_uploaded_file(request.files['profile_photo'], 'photos')
            if photo_path:
                current_user.profile_photo = photo_path

        db.session.commit()
        log_audit(current_user.id, "UPDATE_USER_PROFILE", "Updated personal profile info")

        return api_response(True, "Profile updated successfully", data={
            "user": current_user.to_dict(),
            "candidate_profile": cand.to_dict()
        })

    user_data = current_user.to_dict()
    user_data['candidate_profile'] = cand.to_dict()
    return api_response(True, "Candidate profile", data={"user": user_data})


@user_bp.route('/resume', methods=['POST'])
@user_required
def upload_resume(current_user):
    cand = current_user.candidate_profile
    if not cand:
        cand = CandidateProfile(user_id=current_user.id)
        db.session.add(cand)

    if 'resume' not in request.files:
        return api_response(False, "No resume PDF file uploaded", 400)

    resume_path = save_uploaded_file(request.files['resume'], 'resumes')
    if not resume_path:
        return api_response(False, "Invalid resume file type. Only PDF, DOC, and DOCX are allowed.", 400)

    cand.resume_path = resume_path
    db.session.commit()

    log_audit(current_user.id, "UPLOAD_RESUME", f"Uploaded resume: {resume_path}")
    return api_response(True, "Resume uploaded successfully", data={"resume_path": resume_path})


@user_bp.route('/education', methods=['POST'])
@user_required
def add_education(current_user):
    cand = current_user.candidate_profile
    data = request.get_json() or {}
    
    degree = data.get('degree')
    institution = data.get('institution')
    if not degree or not institution:
        return api_response(False, "Degree and institution are required", 400)

    edu = Education(
        candidate_profile_id=cand.id,
        degree=degree,
        institution=institution,
        specialization=data.get('specialization'),
        start_year=data.get('start_year'),
        end_year=data.get('end_year'),
        score=data.get('score')
    )
    db.session.add(edu)
    db.session.commit()

    return api_response(True, "Education added", data={"education": edu.to_dict()}, status_code=201)


@user_bp.route('/education/<int:edu_id>', methods=['DELETE'])
@user_required
def delete_education(current_user, edu_id):
    edu = Education.query.get(edu_id)
    if not edu or edu.candidate_profile_id != current_user.candidate_profile.id:
        return api_response(False, "Education record not found", 404)
    db.session.delete(edu)
    db.session.commit()
    return api_response(True, "Education deleted")


@user_bp.route('/experience', methods=['POST'])
@user_required
def add_experience(current_user):
    cand = current_user.candidate_profile
    data = request.get_json() or {}

    company = data.get('company')
    title = data.get('title')
    if not company or not title:
        return api_response(False, "Company and title are required", 400)

    exp = Experience(
        candidate_profile_id=cand.id,
        company=company,
        title=title,
        start_date=data.get('start_date'),
        end_date=data.get('end_date'),
        is_current=data.get('is_current', False),
        description=data.get('description')
    )
    db.session.add(exp)
    db.session.commit()

    return api_response(True, "Experience added", data={"experience": exp.to_dict()}, status_code=201)


@user_bp.route('/experience/<int:exp_id>', methods=['DELETE'])
@user_required
def delete_experience(current_user, exp_id):
    exp = Experience.query.get(exp_id)
    if not exp or exp.candidate_profile_id != current_user.candidate_profile.id:
        return api_response(False, "Experience record not found", 404)
    db.session.delete(exp)
    db.session.commit()
    return api_response(True, "Experience deleted")


@user_bp.route('/skills', methods=['POST'])
@user_required
def add_user_skill(current_user):
    cand = current_user.candidate_profile
    data = request.get_json() or {}
    skill_name = data.get('skill_name', '').strip()
    if not skill_name:
        return api_response(False, "Skill name required", 400)

    skill = Skill.query.filter_by(name=skill_name).first()
    if not skill:
        skill = Skill(name=skill_name, category='General')
        db.session.add(skill)
        db.session.flush()

    existing = CandidateSkill.query.filter_by(candidate_profile_id=cand.id, skill_id=skill.id).first()
    if not existing:
        cs = CandidateSkill(candidate_profile_id=cand.id, skill_id=skill.id)
        db.session.add(cs)
        db.session.commit()

    return api_response(True, "Skill added", data={"skills": [s.skill.to_dict() for s in cand.candidate_skills]})


@user_bp.route('/skills/<int:skill_id>', methods=['DELETE'])
@user_required
def remove_user_skill(current_user, skill_id):
    cand = current_user.candidate_profile
    cs = CandidateSkill.query.filter_by(candidate_profile_id=cand.id, skill_id=skill_id).first()
    if cs:
        db.session.delete(cs)
        db.session.commit()
    return api_response(True, "Skill removed")


@user_bp.route('/projects', methods=['POST'])
@user_required
def add_project(current_user):
    cand = current_user.candidate_profile
    data = request.get_json() or {}
    title = data.get('title')
    if not title:
        return api_response(False, "Project title required", 400)

    proj = Project(
        candidate_profile_id=cand.id,
        title=title,
        description=data.get('description'),
        technologies=data.get('technologies'),
        github_link=data.get('github_link'),
        demo_link=data.get('demo_link')
    )
    db.session.add(proj)
    db.session.commit()

    return api_response(True, "Project added", data={"project": proj.to_dict()}, status_code=201)


@user_bp.route('/projects/<int:proj_id>', methods=['DELETE'])
@user_required
def delete_project(current_user, proj_id):
    proj = Project.query.get(proj_id)
    if not proj or proj.candidate_profile_id != current_user.candidate_profile.id:
        return api_response(False, "Project not found", 404)
    db.session.delete(proj)
    db.session.commit()
    return api_response(True, "Project deleted")


@user_bp.route('/applications', methods=['GET'])
@user_required
def get_user_applications(current_user):
    cand = current_user.candidate_profile
    if not cand:
        return api_response(True, "My applications", data={"applications": []})

    applications = Application.query.filter_by(candidate_id=cand.id).order_by(Application.created_at.desc()).all()
    return api_response(True, "My applications", data={"applications": [a.to_dict() for a in applications]})


@user_bp.route('/saved-jobs', methods=['GET', 'POST'])
@user_required
def user_saved_jobs(current_user):
    if request.method == 'POST':
        data = request.get_json() or {}
        job_id = data.get('job_id')
        if not job_id:
            return api_response(False, "Job ID required", 400)

        existing = SavedJob.query.filter_by(user_id=current_user.id, job_id=job_id).first()
        if existing:
            return api_response(True, "Job already saved", data={"saved": True})

        saved = SavedJob(user_id=current_user.id, job_id=job_id)
        db.session.add(saved)
        db.session.commit()

        return api_response(True, "Job saved to bookmarks", data={"saved": True})

    saved_list = SavedJob.query.filter_by(user_id=current_user.id).order_by(SavedJob.saved_at.desc()).all()
    return api_response(True, "Saved jobs", data={"saved_jobs": [s.to_dict() for s in saved_list]})


@user_bp.route('/saved-jobs/<int:job_id>', methods=['DELETE'])
@user_required
def remove_saved_job(current_user, job_id):
    saved = SavedJob.query.filter_by(user_id=current_user.id, job_id=job_id).first()
    if saved:
        db.session.delete(saved)
        db.session.commit()
    return api_response(True, "Saved job removed")


@user_bp.route('/interviews', methods=['GET'])
@user_required
def get_candidate_interviews(current_user):
    interviews = Interview.query.filter_by(candidate_id=current_user.id).order_by(Interview.created_at.desc()).all()
    return api_response(True, "Candidate interviews", data={"interviews": [i.to_dict() for i in interviews]})


@user_bp.route('/report', methods=['POST'])
@user_required
def submit_report(current_user):
    data = request.get_json() or {}
    reason = data.get('reason')
    if not reason:
        return api_response(False, "Reason for report is required", 400)

    report = Report(
        reporter_id=current_user.id,
        job_id=data.get('job_id'),
        hr_id=data.get('hr_id'),
        reason=reason,
        status='pending'
    )
    db.session.add(report)
    db.session.commit()

    log_audit(current_user.id, "SUBMIT_REPORT", f"Submitted report for job #{data.get('job_id')}")

    # Notify Admins
    admins = User.query.filter_by(role='ADMIN').all()
    for admin in admins:
        send_notification(admin.id, "New Violation Report", f"User {current_user.name} submitted a report.", "alert")

    return api_response(True, "Report submitted successfully. Admin will investigate.", data={"report": report.to_dict()})
