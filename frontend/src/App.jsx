import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './layouts/ProtectedRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import UserLayout from './layouts/UserLayout';
import HRLayout from './layouts/HRLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/public/Home';
import Jobs from './pages/public/Jobs';
import JobDetails from './pages/public/JobDetails';
import Companies from './pages/public/Companies';
import CompanyDetails from './pages/public/CompanyDetails';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';

// Candidate Pages
import UserDashboard from './pages/candidate/UserDashboard';
import MyProfile from './pages/candidate/MyProfile';
import EditProfile from './pages/candidate/EditProfile';
import MyApplications from './pages/candidate/MyApplications';
import SavedJobs from './pages/candidate/SavedJobs';
import CandidateInterviews from './pages/candidate/CandidateInterviews';
import CandidateNotifications from './pages/candidate/CandidateNotifications';

// HR Pages
import HRDashboard from './pages/hr/HRDashboard';
import HRProfile from './pages/hr/HRProfile';
import CompanyProfile from './pages/hr/CompanyProfile';
import CreateEditJob from './pages/hr/CreateEditJob';
import HRManageJobs from './pages/hr/HRManageJobs';
import HRJobApplications from './pages/hr/HRJobApplications';
import HRInterviews from './pages/hr/HRInterviews';
import HRNotifications from './pages/hr/HRNotifications';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminHRs from './pages/admin/AdminHRs';
import AdminJobs from './pages/admin/AdminJobs';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminApplications from './pages/admin/AdminApplications';
import AdminReports from './pages/admin/AdminReports';
import AdminTaxonomies from './pages/admin/AdminTaxonomies';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:id" element={<CompanyDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Job Seeker Candidate Routes */}
          <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
            <Route element={<UserLayout />}>
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route path="/user/profile" element={<MyProfile />} />
              <Route path="/user/profile/edit" element={<EditProfile />} />
              <Route path="/user/applications" element={<MyApplications />} />
              <Route path="/user/saved-jobs" element={<SavedJobs />} />
              <Route path="/user/interviews" element={<CandidateInterviews />} />
              <Route path="/user/notifications" element={<CandidateNotifications />} />
            </Route>
          </Route>

          {/* HR Recruiter Routes */}
          <Route element={<ProtectedRoute allowedRoles={['HR']} />}>
            <Route element={<HRLayout />}>
              <Route path="/hr/dashboard" element={<HRDashboard />} />
              <Route path="/hr/profile" element={<HRProfile />} />
              <Route path="/hr/company" element={<CompanyProfile />} />
              <Route path="/hr/jobs/create" element={<CreateEditJob />} />
              <Route path="/hr/jobs/:id/edit" element={<CreateEditJob />} />
              <Route path="/hr/jobs" element={<HRManageJobs />} />
              <Route path="/hr/applications" element={<HRJobApplications />} />
              <Route path="/hr/interviews" element={<HRInterviews />} />
              <Route path="/hr/notifications" element={<HRNotifications />} />
            </Route>
          </Route>

          {/* Super Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/hrs" element={<AdminHRs />} />
              <Route path="/admin/jobs" element={<AdminJobs />} />
              <Route path="/admin/companies" element={<AdminCompanies />} />
              <Route path="/admin/applications" element={<AdminApplications />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/taxonomies" element={<AdminTaxonomies />} />
              <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
