import React from 'react';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../store/uiStore';
import { capitalize } from '../../utils/formatters';
import Button from '../common/Button';

export default function Header() {
  const { user, handleLogout } = useAuth();
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      {/* Workspace Indicator */}
      <div className="hidden lg:block text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Team Workspace
      </div>

      {/* User Profile & Logout (Single Instance on Top Right) */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.full_name}</p>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium capitalize">
            {capitalize(user?.role)}
          </span>
        </div>

        <div className="w-9 h-9 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm select-none">
          {user?.full_name?.charAt(0)?.toUpperCase()}
        </div>

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