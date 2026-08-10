import os
import sys

# Add parent directory to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.extensions import db
from app.models.models import (
    User, Company, HRProfile, CandidateProfile, Category, Location, Skill,
    Job, JobSkill, Application, Education, Experience, Project, CandidateSkill,
    Interview, Notification, Report, AuditLog, SavedJob
)

app = create_app()

def seed_database():
    with app.app_context():
        print("Initializing complete database tables...")
        db.create_all()

        # 1. Single Super Admin Seeding
        existing_admin = User.query.filter_by(role='ADMIN').first()
        if not existing_admin:
            admin = User(
                name="Super Administrator",
                email="admin@jobportal.com",
                role="ADMIN",
                status="active"
            )
            admin.set_password("Admin@123456")
            db.session.add(admin)
            print("Created Single Super Admin: admin@jobportal.com / Admin@123456")

        # 2. Categories Seeding
        categories_data = [
            {"name": "Software Engineering", "description": "Frontend, Backend, Fullstack, Mobile & DevOps", "icon": "Code"},
            {"name": "Data Science & AI", "description": "Machine Learning, Analytics, Data Engineering", "icon": "Database"},
            {"name": "Product & Design", "description": "UI/UX, Product Management, System Design", "icon": "Figma"},
            {"name": "Marketing & Sales", "description": "Digital Marketing, SEO, B2B Sales, Business Dev", "icon": "TrendingUp"},
            {"name": "Finance & HR", "description": "Accounting, Financial Planning, Recruitment", "icon": "Briefcase"},
            {"name": "Cybersecurity & Cloud", "description": "Cloud Security, IAM, Penetration Testing", "icon": "Shield"}
        ]
        cat_map = {}
        for cat in categories_data:
            c = Category.query.filter_by(name=cat["name"]).first()
            if not c:
                c = Category(name=cat["name"], description=cat["description"], icon=cat["icon"])
                db.session.add(c)
                db.session.flush()
            cat_map[cat["name"]] = c.id

        # 3. Locations Seeding
        locations_data = [
            {"city": "Bangalore", "state": "Karnataka", "country": "India"},
            {"city": "Mumbai", "state": "Maharashtra", "country": "India"},
            {"city": "Delhi NCR", "state": "Delhi", "country": "India"},
            {"city": "Hyderabad", "state": "Telangana", "country": "India"},
            {"city": "Pune", "state": "Maharashtra", "country": "India"},
            {"city": "Remote", "state": "Global", "country": "Worldwide"}
        ]
        for loc in locations_data:
            if not Location.query.filter_by(city=loc["city"]).first():
                l = Location(city=loc["city"], state=loc["state"], country=loc["country"])
                db.session.add(l)

        # 4. Skills Seeding
        skills_list = [
            ("Python", "Programming"), ("JavaScript", "Programming"), ("React.js", "Frontend"),
            ("Node.js", "Backend"), ("Flask", "Backend"), ("SQL", "Database"),
            ("Machine Learning", "AI"), ("UI/UX Design", "Design"), ("AWS", "Cloud"),
            ("Docker", "DevOps"), ("TypeScript", "Programming"), ("GraphQL", "Backend"),
            ("PostgreSQL", "Database"), ("Cybersecurity", "Security")
        ]
        skill_map = {}
        for s_name, s_cat in skills_list:
            sk = Skill.query.filter_by(name=s_name).first()
            if not sk:
                sk = Skill(name=s_name, category=s_cat)
                db.session.add(sk)
                db.session.flush()
            skill_map[s_name] = sk.id

        db.session.commit()

        # 5. Seed Multiple Companies & HR Recruiter Accounts
        companies_seed = [
            {
                "name": "TechCorp Solutions",
                "email": "hr@techcorp.com",
                "hr_name": "Sarah Jenkins",
                "phone": "+91 9876543210",
                "desc": "Global enterprise cloud software & AI applications leader.",
                "website": "https://techcorp.example.com",
                "location": "Bangalore, India",
                "industry": "Software & IT Services",
                "size": "500-1000 Employees"
            },
            {
                "name": "InnovateTech Labs",
                "email": "hr@innovatetech.com",
                "hr_name": "David Miller",
                "phone": "+91 9876543211",
                "desc": "High growth product development startup building next-gen web tools.",
                "website": "https://innovate.example.com",
                "location": "Remote / Hyderabad",
                "industry": "Internet & SaaS",
                "size": "50-200 Employees"
            },
            {
                "name": "CyberSoft Systems",
                "email": "hr@cybersoft.com",
                "hr_name": "Anita Roy",
                "phone": "+91 9876543212",
                "desc": "Enterprise security infrastructure and cloud managed services provider.",
                "website": "https://cybersoft.example.com",
                "location": "Mumbai, India",
                "industry": "Cybersecurity",
                "size": "200-500 Employees"
            },
            {
                "name": "FinTech Global",
                "email": "hr@fintechglobal.com",
                "hr_name": "Michael Chang",
                "phone": "+91 9876543213",
                "desc": "Digital banking platform handling micro-payments and algorithmic trading.",
                "website": "https://fintechglobal.example.com",
                "location": "Delhi NCR, India",
                "industry": "Financial Technology",
                "size": "1000+ Employees"
            }
        ]

        hr_users = []
        for comp_data in companies_seed:
            company = Company.query.filter_by(name=comp_data["name"]).first()
            if not company:
                company = Company(
                    name=comp_data["name"],
                    description=comp_data["desc"],
                    website=comp_data["website"],
                    location=comp_data["location"],
                    industry=comp_data["industry"],
                    size=comp_data["size"]
                )
                db.session.add(company)
                db.session.flush()

            hr_user = User.query.filter_by(email=comp_data["email"]).first()
            if not hr_user:
                hr_user = User(
                    name=comp_data["hr_name"],
                    email=comp_data["email"],
                    role="HR",
                    status="active"
                )
                hr_user.set_password("HR@123456")
                db.session.add(hr_user)
                db.session.flush()

                hr_prof = HRProfile(user_id=hr_user.id, company_id=company.id, phone=comp_data["phone"])
                db.session.add(hr_prof)
            hr_users.append((hr_user, company))

        # 6. Seed Candidate Users with Profiles
        candidates_seed = [
            {
                "name": "John Doe",
                "email": "john.doe@example.com",
                "phone": "+91 9123456789",
                "location": "Bangalore",
                "about": "Full Stack Developer with 3+ years experience building React.js and Python Flask microservices.",
                "salary": "14,000,000 INR",
                "notice": "Immediate Joiner",
                "skills": ["Python", "JavaScript", "React.js", "Flask", "SQL"],
                "degree": "B.Tech Computer Science",
                "inst": "IIT Delhi",
                "exp_title": "Frontend Engineer",
                "exp_comp": "InnovateTech Labs"
            },
            {
                "name": "Priya Sharma",
                "email": "priya.sharma@example.com",
                "phone": "+91 9123456780",
                "location": "Remote / Hyderabad",
                "about": "Senior UI/UX Designer & Product Lead passionate about crafting modern accessible web interfaces.",
                "salary": "18,000,000 INR",
                "notice": "15 Days",
                "skills": ["UI/UX Design", "React.js", "TypeScript", "HTML", "CSS"],
                "degree": "M.Des Interaction Design",
                "inst": "NID Ahmedabad",
                "exp_title": "Lead UI Designer",
                "exp_comp": "Creative Studio"
            },
            {
                "name": "Rahul Verma",
                "email": "rahul.verma@example.com",
                "phone": "+91 9123456781",
                "location": "Mumbai",
                "about": "Data Scientist specialized in Python, Machine Learning models, and predictive analytics.",
                "salary": "22,000,000 INR",
                "notice": "30 Days",
                "skills": ["Python", "Machine Learning", "SQL", "AWS", "Docker"],
                "degree": "B.Tech Data Engineering",
                "inst": "BITS Pilani",
                "exp_title": "Data Analyst",
                "exp_comp": "FinTech Global"
            }
        ]

        cand_users = []
        for cdata in candidates_seed:
            cuser = User.query.filter_by(email=cdata["email"]).first()
            if not cuser:
                cuser = User(
                    name=cdata["name"],
                    email=cdata["email"],
                    role="USER",
                    status="active"
                )
                cuser.set_password("User@123456")
                db.session.add(cuser)
                db.session.flush()

                cprof = CandidateProfile(
                    user_id=cuser.id,
                    phone=cdata["phone"],
                    location=cdata["location"],
                    about=cdata["about"],
                    expected_salary=cdata["salary"],
                    notice_period=cdata["notice"],
                    resume_path="/uploads/resumes/default_candidate_resume.pdf"
                )
                db.session.add(cprof)
                db.session.flush()

                edu = Education(
                    candidate_profile_id=cprof.id,
                    degree=cdata["degree"],
                    institution=cdata["inst"],
                    start_year=2018,
                    end_year=2022,
                    score="8.8 CGPA"
                )
                db.session.add(edu)

                exp = Experience(
                    candidate_profile_id=cprof.id,
                    company=cdata["exp_comp"],
                    title=cdata["exp_title"],
                    start_date="2022-06",
                    end_date="2024-06",
                    description="Developed enterprise web software and collaborated with cross-functional teams."
                )
                db.session.add(exp)

                for sk_name in cdata["skills"]:
                    if sk_name in skill_map:
                        cs = CandidateSkill(candidate_profile_id=cprof.id, skill_id=skill_map[sk_name])
                        db.session.add(cs)
            else:
                cprof = cuser.candidate_profile
            cand_users.append((cuser, cprof))

        # 7. Seed Diverse Published Job Postings
        jobs_seed = [
            {
                "title": "Senior Full Stack Engineer",
                "company_idx": 0,
                "cat_name": "Software Engineering",
                "desc": "We are seeking a Senior Full Stack Engineer proficient in React.js, Python Flask, and cloud infrastructure.",
                "resp": "* Architect RESTful APIs\n* Build modern glassmorphism UI components\n* Manage database schemas and deployment pipelines",
                "qual": "B.Tech/M.Tech in CS or equivalent experience",
                "exp": 3, "min_sal": 1400000, "max_sal": 2400000, "loc": "Bangalore (Hybrid)",
                "work": "Hybrid", "emp": "Full-time", "openings": 4, "skills": ["Python", "React.js", "Flask", "SQL"]
            },
            {
                "title": "React.js Frontend Architect",
                "company_idx": 1,
                "cat_name": "Software Engineering",
                "desc": "Join our fast-paced product engineering team to build state-of-the-art interactive web applications.",
                "resp": "* Optimize Core Web Vitals (LCP, INP)\n* Build reusable UI component libraries\n* Integrate REST and WebSocket APIs",
                "qual": "Bachelor's Degree in CS/IT",
                "exp": 2, "min_sal": 1200000, "max_sal": 1800000, "loc": "Remote",
                "work": "Remote", "emp": "Full-time", "openings": 2, "skills": ["JavaScript", "React.js", "TypeScript", "UI/UX Design"]
            },
            {
                "title": "Lead Data Scientist / AI Engineer",
                "company_idx": 3,
                "cat_name": "Data Science & AI",
                "desc": "Build predictive machine learning pipelines and real-time fraud detection algorithms.",
                "resp": "* Train Deep Learning and LLM models\n* Deploy scalable ML microservices on AWS\n* Collaborate with product managers",
                "qual": "Master's or Ph.D. in CS, Data Science, or Applied Mathematics",
                "exp": 4, "min_sal": 2200000, "max_sal": 3500000, "loc": "Delhi NCR",
                "work": "On-site", "emp": "Full-time", "openings": 3, "skills": ["Python", "Machine Learning", "SQL", "AWS"]
            },
            {
                "title": "Cloud Security Specialist",
                "company_idx": 2,
                "cat_name": "Cybersecurity & Cloud",
                "desc": "Manage cloud security posture, penetration testing, and zero-trust IAM policies.",
                "resp": "* Audit cloud infrastructure\n* Perform vulnerability assessments\n* Implement compliance standards",
                "qual": "Certified Information Systems Security Professional (CISSP)",
                "exp": 3, "min_sal": 1600000, "max_sal": 2500000, "loc": "Mumbai",
                "work": "Hybrid", "emp": "Full-time", "openings": 2, "skills": ["AWS", "Docker", "Cybersecurity"]
            },
            {
                "title": "Senior UI/UX Product Designer",
                "company_idx": 1,
                "cat_name": "Product & Design",
                "desc": "Design seamless, beautiful user journeys and modern corporate design systems.",
                "resp": "* Conduct user research and wireframing\n* Design high fidelity interactive prototypes\n* Maintain brand typography and colors",
                "qual": "Degree in Industrial Design, HCI, or visual design portfolio",
                "exp": 2, "min_sal": 1000000, "max_sal": 1600000, "loc": "Remote",
                "work": "Remote", "emp": "Full-time", "openings": 1, "skills": ["UI/UX Design", "React.js"]
            }
        ]

        created_jobs = []
        for jdata in jobs_seed:
            existing_job = Job.query.filter_by(title=jdata["title"]).first()
            if not existing_job:
                hr_user, company = hr_users[jdata["company_idx"]]
                category_id = cat_map.get(jdata["cat_name"])

                job = Job(
                    hr_id=hr_user.id,
                    company_id=company.id,
                    category_id=category_id,
                    title=jdata["title"],
                    description=jdata["desc"],
                    responsibilities=jdata["resp"],
                    qualification=jdata["qual"],
                    experience_years=jdata["exp"],
                    salary_min=jdata["min_sal"],
                    salary_max=jdata["max_sal"],
                    location=jdata["loc"],
                    work_type=jdata["work"],
                    employment_type=jdata["emp"],
                    openings=jdata["openings"],
                    deadline="2026-10-31",
                    status="published"
                )
                db.session.add(job)
                db.session.flush()

                for sk_name in jdata["skills"]:
                    if sk_name in skill_map:
                        js = JobSkill(job_id=job.id, skill_id=skill_map[sk_name])
                        db.session.add(js)
                created_jobs.append(job)

        db.session.commit()

        # 8. Seed Sample Candidate Applications & Scheduled Interviews
        if created_jobs and cand_users:
            app1 = Application.query.filter_by(job_id=created_jobs[0].id, candidate_id=cand_users[0][1].id).first()
            if not app1:
                app1 = Application(
                    job_id=created_jobs[0].id,
                    candidate_id=cand_users[0][1].id,
                    cover_letter="I am very excited about this role and have 3+ years experience with React & Flask.",
                    expected_salary="15,000,000 INR",
                    notice_period="Immediate",
                    status="Shortlisted"
                )
                db.session.add(app1)
                db.session.flush()

                # Interview
                iv1 = Interview(
                    application_id=app1.id,
                    hr_id=created_jobs[0].hr_id,
                    candidate_id=cand_users[0][0].id,
                    job_id=created_jobs[0].id,
                    scheduled_date="2026-08-15",
                    scheduled_time="14:00 PM",
                    interview_type="Online",
                    meeting_link="https://meet.google.com/abc-defg-hij",
                    notes="Technical System Design Round",
                    status="Scheduled"
                )
                db.session.add(iv1)

            app2 = Application.query.filter_by(job_id=created_jobs[1].id, candidate_id=cand_users[1][1].id).first()
            if not app2:
                app2 = Application(
                    job_id=created_jobs[1].id,
                    candidate_id=cand_users[1][1].id,
                    cover_letter="Passionate UI designer looking to lead frontend interfaces.",
                    expected_salary="18,000,000 INR",
                    notice_period="15 Days",
                    status="Under Review"
                )
                db.session.add(app2)

        # 9. Seed Sample Audit Log
        if not AuditLog.query.first():
            log1 = AuditLog(
                user_id=1,
                action="SYSTEM_INIT",
                details="Seeded default database schema with companies, jobs, and candidates",
                ip_address="127.0.0.1"
            )
            db.session.add(log1)

        db.session.commit()
        print("Database seeding completed with rich authentic data!")

if __name__ == '__main__':
    seed_database()
