from flask import Blueprint, request
from app.extensions import db
from app.models.models import User, HRProfile, Company, Job, JobSkill, Application, Skill, Interview, CandidateProfile, Notification
from app.utils.helpers import api_response, log_audit, save_uploaded_file, send_notification
from app.middleware.auth import approved_hr_required, hr_required

hr_bp = Blueprint('hr', __name__, url_prefix='/api/hr')

@hr_bp.route('/stats', methods=['GET'])
@hr_required
def get_hr_stats(current_user):
    hr_profile = current_user.hr_profile
    if not hr_profile or not hr_profile.company_id:
        return api_response(True, "No company assigned", data={
            "total_jobs": 0, "active_jobs": 0, "closed_jobs": 0, "pending_jobs": 0,
            "total_applications": 0, "new_applications": 0, "shortlisted": 0,
            "rejected": 0, "interviews_scheduled": 0, "selected": 0
        })

    jobs = Job.query.filter_by(company_id=hr_profile.company_id).all()
    job_ids = [j.id for j in jobs]

    total_jobs = len(jobs)
    active_jobs = len([j for j in jobs if j.status == 'published'])
    closed_jobs = len([j for j in jobs if j.status == 'closed'])
    pending_jobs = len([j for j in jobs if j.status == 'pending'])

    applications = Application.query.filter(Application.job_id.in_(job_ids)).all() if job_ids else []
    total_applications = len(applications)
    new_applications = len([a for a in applications if a.status == 'Applied'])
    shortlisted = len([a for a in applications if a.status == 'Shortlisted'])
    interviews_scheduled = len([a for a in applications if a.status == 'Interview Scheduled'])
    selected = len([a for a in applications if a.status == 'Selected'])
    rejected = len([a for a in applications if a.status == 'Rejected'])

    return api_response(True, "HR Stats", data={
        "total_jobs": total_jobs,
        "active_jobs": active_jobs,
        "closed_jobs": closed_jobs,
        "pending_jobs": pending_jobs,
        "total_applications": total_applications,
        "new_applications": new_applications,
        "shortlisted": shortlisted,
        "interviews_scheduled": interviews_scheduled,
        "selected": selected,
        "rejected": rejected
    })


@hr_bp.route('/profile', methods=['GET', 'PUT'])
@hr_required
def hr_profile(current_user):
    if request.method == 'PUT':
        data = request.form if request.form else (request.get_json() or {})
        
        current_user.name = data.get('name', current_user.name)
        if 'profile_photo' in request.files:
            photo_path = save_uploaded_file(request.files['profile_photo'], 'photos')
            if photo_path:
                current_user.profile_photo = photo_path

        if current_user.hr_profile:
            current_user.hr_profile.phone = data.get('phone', current_user.hr_profile.phone)

        db.session.commit()
        log_audit(current_user.id, "UPDATE_HR_PROFILE", "Updated HR profile details")
        return api_response(True, "Profile updated successfully", data={"user": current_user.to_dict()})

    user_data = current_user.to_dict()
    if current_user.hr_profile:
        user_data['hr_profile'] = current_user.hr_profile.to_dict()
    return api_response(True, "HR profile fetched", data={"user": user_data})


@hr_bp.route('/company', methods=['GET', 'PUT'])
@hr_required
def company_profile(current_user):
    hr_prof = current_user.hr_profile
    if not hr_prof:
        return api_response(False, "HR profile not found", 404)

    if not hr_prof.company_id:
        company = Company(name=f"{current_user.name}'s Company")
        db.session.add(company)
        db.session.flush()
        hr_prof.company_id = company.id
        db.session.commit()
    else:
        company = Company.query.get(hr_prof.company_id)

    if request.method == 'PUT':
        data = request.form if request.form else (request.get_json() or {})
        company.name = data.get('name', company.name)
        company.description = data.get('description', company.description)
        company.website = data.get('website', company.website)
        company.location = data.get('location', company.location)
        company.industry = data.get('industry', company.industry)
        company.size = data.get('size', company.size)

        if 'logo' in request.files:
            logo_path = save_uploaded_file(request.files['logo'], 'logos')
            if logo_path:
                company.logo = logo_path

        db.session.commit()
        log_audit(current_user.id, "UPDATE_COMPANY_PROFILE", f"Updated company '{company.name}' profile")
        return api_response(True, "Company profile updated", data={"company": company.to_dict()})

    return api_response(True, "Company profile", data={"company": company.to_dict()})


@hr_bp.route('/jobs', methods=['GET', 'POST'])
@hr_required
def hr_jobs(current_user):
    hr_prof = current_user.hr_profile
    if not hr_prof or not hr_prof.company_id:
        company = Company(name=f"{current_user.name}'s Company")
        db.session.add(company)
        db.session.flush()
        if not hr_prof:
            hr_prof = HRProfile(user_id=current_user.id, company_id=company.id)
            db.session.add(hr_prof)
        else:
            hr_prof.company_id = company.id
        db.session.commit()

    if request.method == 'POST':
        data = request.get_json() or {}
        title = data.get('title')
        description = data.get('description')
        location = data.get('location')

        if not title or not description or not location:
            return api_response(False, "Title, description, and location are required", 400)

        # Allow status to be published directly or pending based on input
        job_status = data.get('status', 'published')

        job = Job(
            hr_id=current_user.id,
            company_id=hr_prof.company_id,
            category_id=data.get('category_id'),
            title=title,
            description=description,
            responsibilities=data.get('responsibilities'),
            qualification=data.get('qualification'),
            experience_years=data.get('experience_years', 0),
            salary_min=data.get('salary_min'),
            salary_max=data.get('salary_max'),
            location=location,
            work_type=data.get('work_type', 'On-site'),
            employment_type=data.get('employment_type', 'Full-time'),
            openings=data.get('openings', 1),
            deadline=data.get('deadline'),
            status=job_status
        )
        db.session.add(job)
        db.session.flush()

        # Skill tags
        skills = data.get('skills', [])
        for skill_name in skills:
            skill = Skill.query.filter_by(name=skill_name.strip()).first()
            if not skill:
                skill = Skill(name=skill_name.strip(), category='General')
                db.session.add(skill)
                db.session.flush()
            js = JobSkill(job_id=job.id, skill_id=skill.id)
            db.session.add(js)

        db.session.commit()

        log_audit(current_user.id, "CREATE_JOB", f"Created job posting '{title}' ({job_status})")
        return api_response(True, "Job position created successfully!", data={"job": job.to_dict()}, status_code=201)

    jobs = Job.query.filter_by(company_id=hr_prof.company_id).order_by(Job.created_at.desc()).all()
    return api_response(True, "HR jobs list", data={"jobs": [j.to_dict() for j in jobs]})


@hr_bp.route('/jobs/<int:job_id>', methods=['PUT', 'DELETE'])
@hr_required
def edit_or_delete_job(current_user, job_id):
    hr_prof = current_user.hr_profile
    job = Job.query.filter_by(id=job_id, company_id=hr_prof.company_id).first()
    if not job:
        return api_response(False, "Job not found or access unauthorized", 404)

    if request.method == 'DELETE':
        title = job.title
        db.session.delete(job)
        db.session.commit()
        log_audit(current_user.id, "DELETE_JOB", f"Deleted job posting '{title}'")
        return api_response(True, "Job deleted successfully")

    data = request.get_json() or {}
    job.title = data.get('title', job.title)
    job.description = data.get('description', job.description)
    job.responsibilities = data.get('responsibilities', job.responsibilities)
    job.qualification = data.get('qualification', job.qualification)
    job.experience_years = data.get('experience_years', job.experience_years)
    job.salary_min = data.get('salary_min', job.salary_min)
    job.salary_max = data.get('salary_max', job.salary_max)
    job.location = data.get('location', job.location)
    job.work_type = data.get('work_type', job.work_type)
    job.employment_type = data.get('employment_type', job.employment_type)
    job.openings = data.get('openings', job.openings)
    job.deadline = data.get('deadline', job.deadline)
    if 'status' in data and data['status'] in ['published', 'closed', 'draft', 'pending']:
        job.status = data['status']

    db.session.commit()
    log_audit(current_user.id, "UPDATE_JOB", f"Updated job '{job.title}'")
    return api_response(True, "Job updated successfully", data={"job": job.to_dict()})


@hr_bp.route('/applications', methods=['GET'])
@hr_required
def get_hr_applications(current_user):
    hr_prof = current_user.hr_profile
    if not hr_prof or not hr_prof.company_id:
        return api_response(True, "No company assigned", data={"applications": []})

    jobs = Job.query.filter_by(company_id=hr_prof.company_id).all()
    job_ids = [j.id for j in jobs]

    if not job_ids:
        return api_response(True, "No applications", data={"applications": []})

    status = request.args.get('status', '')
    job_id = request.args.get('job_id', type=int)

    query = Application.query.filter(Application.job_id.in_(job_ids))
    if status:
        query = query.filter_by(status=status)
    if job_id:
        query = query.filter_by(job_id=job_id)

    applications = query.order_by(Application.created_at.desc()).all()
    return api_response(True, "Applications list", data={"applications": [a.to_dict() for a in applications]})


@hr_bp.route('/applications/<int:app_id>/status', methods=['PUT'])
@hr_required
def update_application_status(current_user, app_id):
    data = request.get_json() or {}
    new_status = data.get('status')
    
    valid_statuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected']
    if new_status not in valid_statuses:
        return api_response(False, "Invalid status string", 400)

    application = Application.query.get(app_id)
    if not application or application.job.company_id != current_user.hr_profile.company_id:
        return api_response(False, "Application not found or unauthorized", 404)

    old_status = application.status
    application.status = new_status
    db.session.commit()

    candidate_user_id = application.candidate.user_id
    job_title = application.job.title

    log_audit(current_user.id, "APPLICATION_STATUS_CHANGE", f"Updated app #{app_id} for '{job_title}' from {old_status} to {new_status}")
    send_notification(candidate_user_id, f"Application Status Updated: {new_status}", f"Your application for '{job_title}' is now: {new_status}.", "info")

    return api_response(True, f"Status updated to {new_status}", data={"application": application.to_dict()})


@hr_bp.route('/interviews', methods=['GET', 'POST'])
@hr_required
def manage_interviews(current_user):
    if request.method == 'POST':
        data = request.get_json() or {}
        app_id = data.get('application_id')
        scheduled_date = data.get('scheduled_date')
        scheduled_time = data.get('scheduled_time')

        if not app_id or not scheduled_date or not scheduled_time:
            return api_response(False, "Application ID, date, and time are required", 400)

        app_obj = Application.query.get(app_id)
        if not app_obj or app_obj.job.company_id != current_user.hr_profile.company_id:
            return api_response(False, "Application not found or unauthorized", 404)

        interview = Interview(
            application_id=app_id,
            hr_id=current_user.id,
            candidate_id=app_obj.candidate.user_id,
            job_id=app_obj.job_id,
            scheduled_date=scheduled_date,
            scheduled_time=scheduled_time,
            interview_type=data.get('interview_type', 'Online'),
            meeting_link=data.get('meeting_link', ''),
            location=data.get('location', ''),
            notes=data.get('notes', ''),
            status='Scheduled'
        )
        app_obj.status = 'Interview Scheduled'
        db.session.add(interview)
        db.session.commit()

        log_audit(current_user.id, "SCHEDULE_INTERVIEW", f"Scheduled interview for candidate {app_obj.candidate.user.name} on {scheduled_date}")
        send_notification(
            app_obj.candidate.user_id,
            "Interview Scheduled!",
            f"You have an interview scheduled for '{app_obj.job.title}' on {scheduled_date} at {scheduled_time} ({data.get('interview_type', 'Online')}).",
            "success"
        )

        return api_response(True, "Interview scheduled successfully", data={"interview": interview.to_dict()}, status_code=201)

    interviews = Interview.query.filter_by(hr_id=current_user.id).order_by(Interview.created_at.desc()).all()
    return api_response(True, "Interviews list", data={"interviews": [i.to_dict() for i in interviews]})
