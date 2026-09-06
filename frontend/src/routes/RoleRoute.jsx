import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function RoleRoute({ allowedRoles = [] }) {
  const user = useAuthStore((s) => s.user);
  const hasAccess = user && allowedRoles.includes(user.role);
  return hasAccess ? <Outlet /> : <Navigate to="/dashboard" replace />;
}