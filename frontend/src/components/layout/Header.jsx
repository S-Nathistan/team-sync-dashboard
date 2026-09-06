import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../store/uiStore';
import { capitalize } from '../../utils/formatters';
import Button from '../common/Button';

export default function Header() {
  const { user, handleLogout } = useAuth();
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Mobile Menu Toggle */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
        aria-label="Toggle navigation"
      >
        <Menu size={20} />
      </button>

      {/* Workspace Indicator */}
      <div className="hidden lg:block text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Team Workspace
      </div>

      {/* Clickable Profile Area & Logout Button */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Click avatar or name to go to Account Settings */}
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-3 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-all text-left group"
          title="Open Account Settings"
        >
          <div className="w-9 h-9 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm select-none group-hover:bg-primary-200 transition-colors">
            {user?.full_name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight group-hover:text-primary-600 transition-colors flex items-center gap-1">
              {user?.full_name}
              <SettingsIcon size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium capitalize">
              {capitalize(user?.role)}
            </span>
          </div>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          title="Sign out"
          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 transition-colors"
        >
          <LogOut size={18} />
        </Button>
      </div>
    </header>
  );
}