import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReport, approveReport, requestChanges } from '../../api/reports';
import { formatWeekRange, capitalize } from '../../utils/formatters';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ReportStatusBadge from '../../components/reports/ReportStatusBadge';
import VersionHistory from '../../components/reports/VersionHistory';
import ReviewComments from '../../components/reports/ReviewComments';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Check, RotateCcw } from 'lucide-react';

export default function ReviewReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getReport(id)
      .then((res) => setReport(res.data))
      .catch(() => navigate('/manager/reports'));
  }, [id, navigate]);

  if (!report) return <LoadingSpinner />;

  const v = report.latest_version;
  const isSubmittable = report.status === 'submitted';

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await approveReport(report.id, { comment });
      toast.success('Report approved!');
      navigate('/manager/reports');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Approval failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!comment.trim()) {
      toast.error('Please enter a feedback comment explaining what needs correction.');
      return;
    }
    setSubmitting(true);
    try {
      await requestChanges(report.id, { comment });
      toast.success('Sent back for correction!');
      navigate('/manager/reports');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Review Weekly Report</h2>
          <p className="text-sm text-slate-500">
            {report.user_name} · {formatWeekRange(report.week_start, report.week_end)} (v{report.current_version})
          </p>
        </div>
        <ReportStatusBadge status={report.status} />
      </div>

      {isSubmittable && (
        <Card className="p-6 bg-slate-900 text-white border-none shadow-md space-y-3">
          <h3 className="font-semibold text-base">Manager Review Decision</h3>
          <textarea
            className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Write feedback comments for the member (required for requesting changes)..."
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="danger"
              disabled={submitting}
              onClick={handleRequestChanges}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <RotateCcw size={16} /> Request Changes
            </Button>
            <Button
              variant="success"
              disabled={submitting}
              onClick={handleApprove}
            >
              <Check size={16} /> Approve Report
            </Button>
          </div>
        </Card>
      )}

      <ReviewComments comments={report.review_comments} />

      <Card className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3">Tasks Completed</h3>
          <div className="divide-y divide-slate-100">
            {v?.tasks_completed?.map((t, i) => (
              <div key={i} className="py-2.5 flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium text-slate-800">{t.task_name}</p>
                  <p className="text-xs text-slate-400">Deliverable: {t.output_deliverable || 'N/A'}</p>
                </div>
                <div className="text-right text-xs text-slate-600">
                  {t.actual_percentage}% · {t.time_spent_hours} hrs
                </div>
              </div>
            ))}
          </div>
        </div>

        {v?.tasks_planned && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-2">Planned Next Week</h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{v.tasks_planned}</p>
          </div>
        )}

        {v?.blockers?.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-2">Blockers</h3>
            {v.blockers.map((b, i) => (
              <div key={i} className="p-2.5 rounded bg-rose-50 text-rose-900 text-xs mb-1.5">
                {b.is_key_issue && <span className="font-bold">[KEY] </span>}
                {b.description}
              </div>
            ))}
          </div>
        )}
      </Card>

      <VersionHistory versions={report.versions} reviewComments={report.review_comments} />
    </div>
  );
}