import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  History,
  Settings,
  Users,
  FolderKanban,
  BarChart3,
  GitCompare,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../store/uiStore';

const memberLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/reports/new', icon: PlusCircle, label: 'New Weekly Report' },
  { to: '/reports', icon: History, label: 'My Report History' },
];

const managerLinks = [
  { to: '/manager/dashboard', icon: BarChart3, label: 'Team Analytics' },
  { to: '/manager/reports', icon: FileText, label: 'Team Reports' },
  { to: '/manager/team', icon: Users, label: 'Team Members' },
  { to: '/manager/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/manager/compare', icon: GitCompare, label: 'Side-by-Side Compare' },
];

const adminLinks = [
  { to: '/admin/users', icon: Shield, label: 'User Management' },
];

function SidebarLink({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end={to === '/dashboard' || to === '/manager/dashboard'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? 'bg-primary-50 text-primary-700 font-semibold shadow-xs'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      <Icon size={18} className="shrink-0" />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, isManager, isAdmin } = useAuth();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  const isTeamMember = user?.role === 'team_member';

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => useUIStore.getState().setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Brand Header */}
            <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold shadow-xs">
                <FileSpreadsheet size={18} />
              </div>
              <span className="text-base font-bold text-slate-800 tracking-tight">WeeklyReports</span>
            </div>

            {/* Navigation Menu */}
            <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-9rem)]">
              {/* Show Member Links ONLY to Team Members */}
              {isTeamMember && (
                <>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pb-1">
                    Member Workspace
                  </div>
                  {memberLinks.map((link) => (
                    <SidebarLink key={link.to} {...link} />
                  ))}
                </>
              )}

              {/* Show Manager Links ONLY to Managers/Admins */}
              {isManager && (
                <>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pb-1">
                    Management
                  </div>
                  {managerLinks.map((link) => (
                    <SidebarLink key={link.to} {...link} />
                  ))}
                </>
              )}

              {/* Show Admin Links ONLY to Admins */}
              {isAdmin && (
                <>
                  <div className="pt-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pb-1">
                    Administration
                  </div>
                  {adminLinks.map((link) => (
                    <SidebarLink key={link.to} {...link} />
                  ))}
                </>
              )}
            </nav>
          </div>

          {/* Unified Bottom Settings Area (Ensures exactly ONE Settings link for everyone) */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
            <SidebarLink to="/settings" icon={Settings} label="Account Settings" />
          </div>
        </div>
      </aside>
    </>
  );
}