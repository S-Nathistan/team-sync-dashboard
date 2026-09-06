import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck, CheckCircle2, RefreshCcw, AlertOctagon, ArrowUpRight } from 'lucide-react';
import Card from '../common/Card';
import { getCurrentWeekRange } from '../../utils/formatters';

export default function SummaryCards({ summary }) {
  const navigate = useNavigate();
  if (!summary) return null;

  const currentWeek = getCurrentWeekRange().start;

  const cards = [
    {
      title: 'Submitted This Week',
      value: summary.total_reports_this_week,
      subtitle: `Out of ${summary.total_team_members} members · Click to view all 3`,
      icon: FileCheck,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      onClick: () => navigate(`/manager/reports?week_start=${currentWeek}`),
    },
    {
      title: 'Compliance Rate',
      value: `${summary.submission_compliance_rate}%`,
      subtitle: `${summary.total_pending} pending · Click to view team`,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      onClick: () => navigate('/manager/team'),
    },
    {
      title: 'Needs Correction',
      value: summary.total_needs_correction,
      subtitle: 'Awaiting update · Click to view',
      icon: RefreshCcw,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      onClick: () => navigate('/manager/reports?status=needs_correction'),
    },
    {
      title: 'Open Blockers',
      value: summary.open_blockers_count,
      subtitle: 'Click for side-by-side view',
      icon: AlertOctagon,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      onClick: () => navigate('/manager/compare'),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <Card
            key={i}
            onClick={c.onClick}
            className="flex items-center justify-between p-5 cursor-pointer hover:shadow-md hover:border-primary-300 transition-all group"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                {c.title}
                <ArrowUpRight 
                  size={14} 
                  className="text-slate-400 group-hover:text-primary-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" 
                />
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{c.value}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{c.subtitle}</p>
            </div>
            <div className={`p-3 rounded-xl ${c.bg} ${c.color} group-hover:scale-105 transition-transform`}>
              <Icon size={24} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}