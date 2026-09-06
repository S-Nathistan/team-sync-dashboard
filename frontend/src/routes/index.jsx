import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

import AuthLayout from '../components/layout/AuthLayout';
import AppLayout from '../components/layout/AppLayout';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

import MemberDashboard from '../pages/member/MemberDashboard';
import CreateReport from '../pages/member/CreateReport';
import EditReport from '../pages/member/EditReport';
import ViewReport from '../pages/member/ViewReport';
import ReportHistory from '../pages/member/ReportHistory';
import Settings from '../pages/member/Settings';

import ManagerDashboard from '../pages/manager/ManagerDashboard';
import TeamReports from '../pages/manager/TeamReports';
import ReviewReport from '../pages/manager/ReviewReport';
import TeamMembers from '../pages/manager/TeamMembers';
import MemberProfile from '../pages/manager/MemberProfile';
import ProjectManagement from '../pages/manager/ProjectManagement';
import SectionComparison from '../pages/manager/SectionComparison';
import UserManagement from '../pages/admin/UserManagement';

function HomeRedirect() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'manager' || user.role === 'admin') {
    return <Navigate to="/manager/dashboard" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected App Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* Smart Redirect at Root */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Account Settings (Accessible by EVERY Authenticated User) */}
          <Route path="/settings" element={<Settings />} />

          {/* Team Member ONLY Routes */}
          <Route element={<RoleRoute allowedRoles={['team_member']} />}>
            <Route path="/dashboard" element={<MemberDashboard />} />
            <Route path="/reports/new" element={<CreateReport />} />
            <Route path="/reports/:id/edit" element={<EditReport />} />
            <Route path="/reports/:id" element={<ViewReport />} />
            <Route path="/reports" element={<ReportHistory />} />
          </Route>

          {/* Manager & Admin ONLY Routes */}
          <Route element={<RoleRoute allowedRoles={['manager', 'admin']} />}>
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/reports" element={<TeamReports />} />
            <Route path="/manager/reports/:id" element={<ReviewReport />} />
            <Route path="/manager/team" element={<TeamMembers />} />
            <Route path="/manager/team/:id" element={<MemberProfile />} />
            <Route path="/manager/projects" element={<ProjectManagement />} />
            <Route path="/manager/compare" element={<SectionComparison />} />
          </Route>

          {/* Admin ONLY Routes */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/admin/users" element={<UserManagement />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}