import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReport } from '../../api/reports';
import { formatWeekRange, capitalize } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ReportStatusBadge from '../../components/reports/ReportStatusBadge';
import VersionHistory from '../../components/reports/VersionHistory';
import ReviewComments from '../../components/reports/ReviewComments';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Calendar, User, Folder, Edit3 } from 'lucide-react';

export default function ViewReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReport(id)
      .then((res) => setReport(res.data))
      .catch(() => navigate('/reports'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading || !report) return <LoadingSpinner />;

  const v = report.latest_version;
  const isOwner = report.user_id === user?.id;
  const canEdit = isOwner && (report.status === 'draft' || report.status === 'needs_correction');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">Weekly Report</h2>
            <ReportStatusBadge status={report.status} />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1.5">
            <span className="flex items-center gap-1"><User size={14} /> {report.user_name}</span>
            <span className="flex items-center gap-1"><Calendar size={14} /> {formatWeekRange(report.week_start, report.week_end)}</span>
            {report.project_name && (
              <span className="flex items-center gap-1"><Folder size={14} /> {report.project_name}</span>
            )}
          </div>
        </div>

        {canEdit && (
          <Button onClick={() => navigate(`/reports/${report.id}/edit`)}>
            <Edit3 size={16} /> Edit Report
          </Button>
        )}
      </div>

      <ReviewComments comments={report.review_comments} />

      {/* Main Content Details */}
      <Card className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3">Tasks Completed</h3>
          <div className="divide-y divide-slate-100">
            {v?.tasks_completed?.map((t, idx) => (
              <div key={idx} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-800">{t.task_name}</p>
                  <p className="text-xs text-slate-400">Status: {capitalize(t.status)} · Priority: {capitalize(t.priority)}</p>
                </div>
                <div className="text-right text-xs text-slate-600 font-medium">
                  {t.actual_percentage}% complete ({t.time_spent_hours} hrs)
                </div>
              </div>
            ))}
          </div>
        </div>

        {v?.tasks_planned && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-2">Planned For Next Week</h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{v.tasks_planned}</p>
          </div>
        )}

        {v?.blockers?.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-2">Blockers</h3>
            <div className="space-y-2">
              {v.blockers.map((b, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-rose-50 text-rose-900 text-xs">
                  {b.is_key_issue && <strong className="text-rose-700">[KEY ISSUE] </strong>}
                  {b.description}
                </div>
              ))}
            </div>
          </div>
        )}

        {v?.achievements?.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-2">Achievements</h3>
            <div className="space-y-2">
              {v.achievements.map((a, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-emerald-50 text-emerald-900 text-xs">
                  {a.is_key_achievement && <strong className="text-emerald-700">[HIGHLIGHT] </strong>}
                  {a.description}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <VersionHistory versions={report.versions} reviewComments={report.review_comments} />
    </div>
  );
}