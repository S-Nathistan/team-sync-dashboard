import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FolderOpen } from 'lucide-react';
import Card from '../common/Card';
import ReportStatusBadge from './ReportStatusBadge';
import { formatWeekRange } from '../../utils/formatters';

export default function ReportCard({ report }) {
  const navigate = useNavigate();
  return (
    <Card onClick={() => navigate(`/reports/${report.id}`)} className="hover:border-primary-300">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500"><Calendar size={14} />{formatWeekRange(report.week_start, report.week_end)}</div>
          {report.project_name && <div className="flex items-center gap-1 text-sm text-gray-400 mt-1"><FolderOpen size={14} />{report.project_name}</div>}
        </div>
        <ReportStatusBadge status={report.status} />
      </div>
      {report.user_name && <p className="text-sm font-medium text-gray-700">{report.user_name}</p>}
      {report.latest_version && <p className="text-xs text-gray-400 mt-2 line-clamp-2">{report.latest_version.tasks_completed?.length || 0} tasks · {report.latest_version.blockers?.length || 0} blockers</p>}
    </Card>
  );
}