# Production-Level Job Portal Web Application

A complete, modern, responsive full-stack recruitment platform (similar to LinkedIn Jobs, Naukri, or Indeed) built with **React.js (Vite)** on the frontend, **Python (Flask REST API)** on the backend, and **SQLAlchemy (SQLite / MySQL)** for relational data storage.

The platform supports **Three Roles**:
1. **1 Super Admin** (Global platform control, HR approvals, Job moderation, Reports, Taxonomies, Audit Logs)
2. **Multiple HR Users / Employers** (Recruitment dashboard, Company profile, Job posting workflows, Applicant tracking, Interview scheduling)
3. **Unlimited Normal Job Seekers / Candidates** (Job search & filters, Profile builder, PDF resume upload, Job applications, Bookmarks, Interview tracking, Notifications)

---

## 🌟 Key Features

### 1. Single Super Admin Control
- **Strict Single Admin Rule**: Guaranteed by backend validation and database initialization. No Super Admin accounts can be created via public registration.
- **HR Approval Workflow**: New HR registrations are set to `pending` and require Super Admin approval before recruitment tools are unlocked.
- **Job Moderation Queue**: HR job posts enter `pending` status and must be approved by Super Admin before going live.
- **Platform Analytics**: Total users, HRs, Companies, Jobs, Applications, Reports, and Hiring pipeline metrics.
- **Taxonomies Management**: Full CRUD for Job Categories, Locations, and Master Skill sets.
- **Security Audit Trail**: Immutable logging of user logins, role actions, status changes, and IP addresses.

### 2. HR & Employer Recruitment Portal
- **Recruitment Dashboard**: Metrics for Active Jobs, Total Applications, Shortlisted candidates, Interviews Scheduled, Selected, and Rejected candidates.
- **Company Profile Management**: Company logo upload, industry, company size, headquarters location, website, and description.
- **Job Posting Workflow**: Create, edit, close, reopen, or delete job positions.
- **Candidate Applicant Tracker**: Inspect applicant profile details, education, work history, skills, cover letter, and view PDF resumes directly.
- **Interview Scheduling**: Schedule online video calls, phone screens, or in-person interviews with automatic candidate notifications.

### 3. Job Seeker / Candidate Experience
- **Job Search & Filters**: Multi-parameter search by keyword, location, category, work mode (Remote/Hybrid/On-site), employment type (Full-time/Part-time/Contract), and salary ranges.
- **Profile & Resume Builder**: Manage education history, work experience timeline, technical skills tags, personal projects with GitHub/live demo links, and PDF resume upload.
- **Application Tracking**: Monitor application statuses (`Applied`, `Under Review`, `Shortlisted`, `Interview Scheduled`, `Selected`, `Rejected`).
- **Bookmarked / Saved Jobs**: Bookmark positions to review or apply later.
- **In-App Notifications**: Real-time updates when application status changes or an interview is scheduled.

---

## 🏗️ Technology Stack

- **Frontend**: React.js 18 (Vite), React Router v6, Lucide Icons, Axios, Recharts
- **Backend**: Python 3.14, Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-Cors, Werkzeug
- **Database**: SQLite (default zero-config fallback) or MySQL (compatible via `mysql+pymysql://...`)
- **Authentication**: JWT-based stateless tokens with RBAC middleware decorators
- **Storage**: Local uploads folder (`/uploads/photos`, `/uploads/logos`, `/uploads/resumes`) with modular serving routes

---

## 📁 Project Structure

```text
job-portal/
├── backend/
│   ├── app/
│   │   ├── __init__.py           # Flask App Factory & upload static routes
│   │   ├── config.py             # Configuration (Database URI, JWT, upload limits)
│   │   ├── extensions.py         # SQLAlchemy, JWTManager, CORS
│   │   ├── models/
│   │   │   └── models.py         # Relational DB Models (20+ entities)
│   │   ├── middleware/
│   │   │   └── auth.py           # JWT auth & RBAC role guards (@admin_required, etc.)
│   │   ├── utils/
│   │   │   └── helpers.py        # Response formatters, audit logging, notifications, file uploaders
│   │   └── routes/
│   │       ├── auth_routes.py    # /api/auth (Login, Register, Logout, Me, Password Reset)
│   │       ├── admin_routes.py   # /api/admin (Dashboard stats, Users, HRs, Jobs, Audit logs, Taxonomies)
│   │       ├── hr_routes.py      # /api/hr (Dashboard stats, Company, Job CRUD, Applicant management)
│   │       ├── user_routes.py    # /api/user (Profile, Resume, Education, Experience, Projects, Applications)
│   │       ├── job_routes.py     # /api (Public job search, Job details, Application submission)
│   │       ├── company_routes.py # /api/companies (Public company directory & details)
│   │       └── notification_routes.py # /api/notifications (User notifications & mark read)
│   ├── uploads/                  # Storage folder for photos, company logos, and resume PDFs
│   ├── seed/
│   │   └── seed_db.py            # Initial DB creation & Single Admin seeder script
│   ├── .env                      # Environment configuration
│   ├── .env.example              # Environment template
│   ├── requirements.txt          # Python dependencies
│   └── run.py                    # Backend server entrypoint
│
├── frontend/
│   ├── src/
│   │   ├── components/           # StatCard, JobCard, StatusBadge, Modal, SearchBar
│   │   ├── context/              # AuthContext (JWT storage, User state, Notifications)
│   │   ├── layouts/              # PublicLayout, UserLayout, HRLayout, AdminLayout, ProtectedRoute
│   │   ├── pages/
│   │   │   ├── public/           # Home, Jobs, JobDetails, Companies, CompanyDetails, Login, Register
│   │   │   ├── candidate/        # UserDashboard, MyProfile, EditProfile, MyApplications, SavedJobs, Interviews
│   │   │   ├── hr/               # HRDashboard, HRProfile, CompanyProfile, CreateEditJob, HRManageJobs, HRJobApplications
│   │   │   └── admin/            # AdminDashboard, AdminUsers, AdminHRs, AdminJobs, AdminCompanies, Reports, AuditLogs
│   │   ├── services/             # Axios API service client
│   │   ├── styles/               # Main design system stylesheet (index.css)
│   │   ├── App.jsx               # Route definitions & RBAC wrappers
│   │   └── main.jsx              # React DOM render entry
│   ├── package.json              # Frontend npm dependencies
│   └── vite.config.js            # Vite build configuration
│
└── README.md                     # Documentation
```

---

## 🔑 Initial Default Test Credentials

The database comes pre-seeded with sample accounts for testing all three roles:

| Role | Email | Password | Status | Access |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@jobportal.com` | `Admin@123456` | `active` | Full System Admin Portal (`/admin/dashboard`) |
| **Sample HR** | `hr@techcorp.com` | `HR@123456` | `active` | Recruiter Portal (`/hr/dashboard`) |
| **Job Seeker** | `john.doe@example.com` | `User@123456` | `active` | Candidate Portal (`/user/dashboard`) |

> Note: Quick Login buttons are also available on the `/login` screen to populate these credentials instantly.

---

## 🚀 Quickstart & Setup Guide

### 1. Backend Setup (Flask REST API)

1. Open terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure `.env` file:
   ```env
   FLASK_APP=run.py
   FLASK_ENV=development
   SECRET_KEY=your_secret_key_here
   JWT_SECRET_KEY=your_jwt_secret_key_here
   DATABASE_URL=sqlite:///job_portal.db
   # For MySQL, use: mysql+pymysql://username:password@localhost:3306/job_portal
   PORT=5000
   ```

5. Run the Backend Server (Auto initializes DB and seeds default accounts):
   ```bash
   python run.py
   ```
   *The Flask API will run on `http://127.0.0.1:5000`.*

---

### 2. Frontend Setup (React.js + Vite)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Vite Development Server:
   ```bash
   npm run dev
   ```
   *The React App will run on `http://localhost:5173/` or `http://localhost:5174/`.*

---

## 📡 REST API Documentation Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new Job Seeker or HR user
- `POST /api/auth/login` - Authenticate and return JWT token
- `GET /api/auth/me` - Get logged-in user profile details
- `POST /api/auth/logout` - Invalidate session

### Jobs & Applications (`/api`)
- `GET /api/jobs` - Search published jobs with filters, sorting, and pagination
- `GET /api/jobs/:id` - Fetch job details
- `POST /api/jobs/:id/apply` - Submit job application (with profile & duplicate validation)
- `GET /api/companies` - List companies
- `GET /api/categories` - List categories

### HR Recruitment (`/api/hr`)
- `GET /api/hr/stats` - HR metrics & funnel statistics
- `PUT /api/hr/company` - Manage company profile & logo
- `POST /api/hr/jobs` - Create new job position (status: `pending`)
- `PUT /api/hr/jobs/:id` - Edit or change status (`published`, `closed`)
- `GET /api/hr/applications` - View applicants for company jobs
- `PUT /api/hr/applications/:id/status` - Update applicant status
- `POST /api/hr/interviews` - Schedule candidate interview

### Super Admin Control (`/api/admin`)
- `GET /api/admin/stats` - Platform-wide statistics
- `GET /api/admin/hrs` - View & approve/reject pending HR accounts
- `GET /api/admin/jobs` - View & approve/reject pending job posts
- `GET /api/admin/users` - View & activate/deactivate candidate accounts
- `GET /api/admin/reports` - Manage user violation reports
- `GET /api/admin/audit-logs` - View system activity audit trail

---

## 📦 Production Deployment

### Frontend (Vercel / Netlify)
1. Run build: `npm run build`
2. Deploy the `dist` output directory to Vercel or Netlify.
3. Configure `VITE_API_URL` environment variable pointing to hosted Flask API.

### Backend (Render / Railway / AWS EC2)
1. Set up a MySQL database (e.g. AWS RDS or Aiven MySQL).
2. Configure `DATABASE_URL` in environment variables: `mysql+pymysql://user:pass@host:3306/dbname`.
3. Start using a production WSGI server such as `gunicorn`:
   ```bash
   gunicorn run:app --bind 0.0.0.0:5000
   ```
