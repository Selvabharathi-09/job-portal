from datetime import datetime
from app.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='USER') # ADMIN, HR, USER
    status = db.Column(db.String(20), nullable=False, default='active') # active, pending, deactivated, rejected
    profile_photo = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    candidate_profile = db.relationship('CandidateProfile', backref='user', uselist=False, cascade="all, delete-orphan")
    hr_profile = db.relationship('HRProfile', backref='user', uselist=False, cascade="all, delete-orphan")
    notifications = db.relationship('Notification', backref='user', cascade="all, delete-orphan")
    audit_logs = db.relationship('AuditLog', backref='user', cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'status': self.status,
            'profile_photo': self.profile_photo,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Company(db.Model):
    __tablename__ = 'companies'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False, index=True)
    logo = db.Column(db.String(255), nullable=True)
    description = db.Column(db.Text, nullable=True)
    website = db.Column(db.String(255), nullable=True)
    location = db.Column(db.String(150), nullable=True)
    industry = db.Column(db.String(100), nullable=True)
    size = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    jobs = db.relationship('Job', backref='company', cascade="all, delete-orphan")
    hrs = db.relationship('HRProfile', backref='company')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'logo': self.logo,
            'description': self.description,
            'website': self.website,
            'location': self.location,
            'industry': self.industry,
            'size': self.size,
            'active_jobs_count': len([j for j in self.jobs if j.status == 'published']),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class HRProfile(db.Model):
    __tablename__ = 'hr_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id', ondelete='SET NULL'), nullable=True)
    phone = db.Column(db.String(30), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'company_id': self.company_id,
            'phone': self.phone,
            'company': self.company.to_dict() if self.company else None
        }


class CandidateProfile(db.Model):
    __tablename__ = 'candidate_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)
    phone = db.Column(db.String(30), nullable=True)
    location = db.Column(db.String(150), nullable=True)
    dob = db.Column(db.String(20), nullable=True)
    about = db.Column(db.Text, nullable=True)
    expected_salary = db.Column(db.String(50), nullable=True)
    notice_period = db.Column(db.String(50), nullable=True)
    resume_path = db.Column(db.String(255), nullable=True)

    # Relationships
    educations = db.relationship('Education', backref='candidate', cascade="all, delete-orphan")
    experiences = db.relationship('Experience', backref='candidate', cascade="all, delete-orphan")
    projects = db.relationship('Project', backref='candidate', cascade="all, delete-orphan")
    candidate_skills = db.relationship('CandidateSkill', backref='candidate', cascade="all, delete-orphan")
    applications = db.relationship('Application', backref='candidate', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'phone': self.phone,
            'location': self.location,
            'dob': self.dob,
            'about': self.about,
            'expected_salary': self.expected_salary,
            'notice_period': self.notice_period,
            'resume_path': self.resume_path,
            'educations': [e.to_dict() for e in self.educations],
            'experiences': [exp.to_dict() for exp in self.experiences],
            'projects': [p.to_dict() for p in self.projects],
            'skills': [cs.skill.to_dict() for cs in self.candidate_skills if cs.skill]
        }


class Education(db.Model):
    __tablename__ = 'educations'

    id = db.Column(db.Integer, primary_key=True)
    candidate_profile_id = db.Column(db.Integer, db.ForeignKey('candidate_profiles.id', ondelete='CASCADE'), nullable=False)
    degree = db.Column(db.String(100), nullable=False)
    institution = db.Column(db.String(150), nullable=False)
    specialization = db.Column(db.String(100), nullable=True)
    start_year = db.Column(db.Integer, nullable=True)
    end_year = db.Column(db.Integer, nullable=True)
    score = db.Column(db.String(50), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'degree': self.degree,
            'institution': self.institution,
            'specialization': self.specialization,
            'start_year': self.start_year,
            'end_year': self.end_year,
            'score': self.score
        }


class Experience(db.Model):
    __tablename__ = 'experiences'

    id = db.Column(db.Integer, primary_key=True)
    candidate_profile_id = db.Column(db.Integer, db.ForeignKey('candidate_profiles.id', ondelete='CASCADE'), nullable=False)
    company = db.Column(db.String(150), nullable=False)
    title = db.Column(db.String(120), nullable=False)
    start_date = db.Column(db.String(30), nullable=True)
    end_date = db.Column(db.String(30), nullable=True)
    is_current = db.Column(db.Boolean, default=False)
    description = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'company': self.company,
            'title': self.title,
            'start_date': self.start_date,
            'end_date': self.end_date,
            'is_current': self.is_current,
            'description': self.description
        }


class Project(db.Model):
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    candidate_profile_id = db.Column(db.Integer, db.ForeignKey('candidate_profiles.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    technologies = db.Column(db.String(255), nullable=True)
    github_link = db.Column(db.String(255), nullable=True)
    demo_link = db.Column(db.String(255), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'technologies': self.technologies,
            'github_link': self.github_link,
            'demo_link': self.demo_link
        }


class Skill(db.Model):
    __tablename__ = 'skills'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False, index=True)
    category = db.Column(db.String(100), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category
        }


class CandidateSkill(db.Model):
    __tablename__ = 'candidate_skills'

    id = db.Column(db.Integer, primary_key=True)
    candidate_profile_id = db.Column(db.Integer, db.ForeignKey('candidate_profiles.id', ondelete='CASCADE'), nullable=False)
    skill_id = db.Column(db.Integer, db.ForeignKey('skills.id', ondelete='CASCADE'), nullable=False)

    skill = db.relationship('Skill')


class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)
    icon = db.Column(db.String(50), nullable=True)

    jobs = db.relationship('Job', backref='category')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'icon': self.icon
        }


class Location(db.Model):
    __tablename__ = 'locations'

    id = db.Column(db.Integer, primary_key=True)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=True)
    country = db.Column(db.String(100), nullable=False, default='India')

    def to_dict(self):
        return {
            'id': self.id,
            'city': self.city,
            'state': self.state,
            'country': self.country
        }


class Job(db.Model):
    __tablename__ = 'jobs'

    id = db.Column(db.Integer, primary_key=True)
    hr_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id', ondelete='CASCADE'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id', ondelete='SET NULL'), nullable=True)
    
    title = db.Column(db.String(150), nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    responsibilities = db.Column(db.Text, nullable=True)
    qualification = db.Column(db.String(200), nullable=True)
    experience_years = db.Column(db.Integer, nullable=False, default=0)
    salary_min = db.Column(db.Integer, nullable=True)
    salary_max = db.Column(db.Integer, nullable=True)
    location = db.Column(db.String(150), nullable=False)
    work_type = db.Column(db.String(50), nullable=False, default='On-site') # Remote, Hybrid, On-site
    employment_type = db.Column(db.String(50), nullable=False, default='Full-time') # Full-time, Part-time, Contract, Internship
    openings = db.Column(db.Integer, nullable=False, default=1)
    deadline = db.Column(db.String(30), nullable=True)
    status = db.Column(db.String(30), nullable=False, default='pending') # draft, pending, published, closed, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    job_skills = db.relationship('JobSkill', backref='job', cascade="all, delete-orphan")
    applications = db.relationship('Application', backref='job', cascade="all, delete-orphan")
    saved_by_users = db.relationship('SavedJob', backref='job', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'hr_id': self.hr_id,
            'company_id': self.company_id,
            'company': self.company.to_dict() if self.company else None,
            'category_id': self.category_id,
            'category': self.category.name if self.category else None,
            'title': self.title,
            'description': self.description,
            'responsibilities': self.responsibilities,
            'qualification': self.qualification,
            'experience_years': self.experience_years,
            'salary_min': self.salary_min,
            'salary_max': self.salary_max,
            'location': self.location,
            'work_type': self.work_type,
            'employment_type': self.employment_type,
            'openings': self.openings,
            'deadline': self.deadline,
            'status': self.status,
            'applications_count': len(self.applications),
            'skills': [js.skill.to_dict() for js in self.job_skills if js.skill],
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class JobSkill(db.Model):
    __tablename__ = 'job_skills'

    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id', ondelete='CASCADE'), nullable=False)
    skill_id = db.Column(db.Integer, db.ForeignKey('skills.id', ondelete='CASCADE'), nullable=False)

    skill = db.relationship('Skill')


class Application(db.Model):
    __tablename__ = 'applications'
    __table_args__ = (
        db.UniqueConstraint('job_id', 'candidate_id', name='uq_job_candidate'),
    )

    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id', ondelete='CASCADE'), nullable=False)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidate_profiles.id', ondelete='CASCADE'), nullable=False)
    cover_letter = db.Column(db.Text, nullable=True)
    expected_salary = db.Column(db.String(50), nullable=True)
    notice_period = db.Column(db.String(50), nullable=True)
    status = db.Column(db.String(50), nullable=False, default='Applied') 
    # Statuses: Applied, Under Review, Shortlisted, Interview Scheduled, Selected, Rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    interviews = db.relationship('Interview', backref='application', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'job_id': self.job_id,
            'job': self.job.to_dict() if self.job else None,
            'candidate_id': self.candidate_id,
            'candidate': {
                'id': self.candidate.id,
                'user_id': self.candidate.user_id,
                'user_name': self.candidate.user.name if self.candidate.user else '',
                'user_email': self.candidate.user.email if self.candidate.user else '',
                'profile_photo': self.candidate.user.profile_photo if self.candidate.user else None,
                'phone': self.candidate.phone,
                'location': self.candidate.location,
                'about': self.candidate.about,
                'resume_path': self.candidate.resume_path,
                'skills': [cs.skill.to_dict() for cs in self.candidate.candidate_skills if cs.skill],
                'educations': [e.to_dict() for e in self.candidate.educations],
                'experiences': [exp.to_dict() for exp in self.candidate.experiences],
                'projects': [p.to_dict() for p in self.candidate.projects]
            } if self.candidate else None,
            'cover_letter': self.cover_letter,
            'expected_salary': self.expected_salary,
            'notice_period': self.notice_period,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class SavedJob(db.Model):
    __tablename__ = 'saved_jobs'
    __table_args__ = (
        db.UniqueConstraint('user_id', 'job_id', name='uq_user_saved_job'),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id', ondelete='CASCADE'), nullable=False)
    saved_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'job_id': self.job_id,
            'job': self.job.to_dict() if self.job else None,
            'saved_at': self.saved_at.isoformat() if self.saved_at else None
        }


class Interview(db.Model):
    __tablename__ = 'interviews'

    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, db.ForeignKey('applications.id', ondelete='CASCADE'), nullable=False)
    hr_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    candidate_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id', ondelete='CASCADE'), nullable=False)
    
    scheduled_date = db.Column(db.String(30), nullable=False)
    scheduled_time = db.Column(db.String(30), nullable=False)
    interview_type = db.Column(db.String(50), nullable=False, default='Online') # Online, Phone, In-person
    meeting_link = db.Column(db.String(255), nullable=True)
    location = db.Column(db.String(255), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(30), nullable=False, default='Scheduled') # Scheduled, Completed, Cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'application_id': self.application_id,
            'hr_id': self.hr_id,
            'candidate_id': self.candidate_id,
            'job_id': self.job_id,
            'job_title': self.application.job.title if self.application and self.application.job else '',
            'company_name': self.application.job.company.name if self.application and self.application.job and self.application.job.company else '',
            'candidate_name': self.application.candidate.user.name if self.application and self.application.candidate and self.application.candidate.user else '',
            'scheduled_date': self.scheduled_date,
            'scheduled_time': self.scheduled_time,
            'interview_type': self.interview_type,
            'meeting_link': self.meeting_link,
            'location': self.location,
            'notes': self.notes,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False, default='info') # info, success, warning, alert
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Report(db.Model):
    __tablename__ = 'reports'

    id = db.Column(db.Integer, primary_key=True)
    reporter_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id', ondelete='CASCADE'), nullable=True)
    hr_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True)
    reason = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(30), nullable=False, default='pending') # pending, resolved, dismissed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    reporter = db.relationship('User', foreign_keys=[reporter_id])
    hr_user = db.relationship('User', foreign_keys=[hr_id])

    def to_dict(self):
        return {
            'id': self.id,
            'reporter_id': self.reporter_id,
            'reporter_name': self.reporter.name if self.reporter else 'Anonymous',
            'job_id': self.job_id,
            'job_title': self.job.title if self.job else None,
            'hr_id': self.hr_id,
            'hr_name': self.hr_user.name if self.hr_user else None,
            'reason': self.reason,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    action = db.Column(db.String(150), nullable=False)
    details = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else 'System',
            'user_email': self.user.email if self.user else 'system@jobportal.com',
            'user_role': self.user.role if self.user else 'SYSTEM',
            'action': self.action,
            'details': self.details,
            'ip_address': self.ip_address,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
