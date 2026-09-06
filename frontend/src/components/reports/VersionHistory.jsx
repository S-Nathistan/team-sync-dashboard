import React, { useState } from 'react';
import { Clock, ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export default function VersionHistory({ versions = [], reviewComments = [] }) {
  const [expandedVersion, setExpandedVersion] = useState(null);
  if (!versions || versions.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
        <Clock size={18} className="text-primary-600" /> Report Versions Archive
      </h3>
      {versions.map((v) => {
        const comments = reviewComments.filter((c) => c.version_number === v.version_number);
        const isExpanded = expandedVersion === v.version_number;
        return (
          <div key={v.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <button type="button" className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left" onClick={() => setExpandedVersion(isExpanded ? null : v.version_number)}>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm text-slate-800">Version {v.version_number}</span>
                <span className="text-xs text-slate-500">{formatDateTime(v.submitted_at || v.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                {comments.length > 0 && <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">{comments.length} review(s)</span>}
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>
            {isExpanded && (
              <div className="p-4 space-y-4 text-sm border-t border-slate-200">
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Tasks ({v.tasks_completed?.length || 0})</h4>
                  {v.tasks_completed?.map((t, i) => (
                    <div key={i} className="flex justify-between py-1.5 px-2 rounded bg-slate-50 text-xs">
                      <span className="font-medium">{t.task_name}</span>
                      <span className="text-slate-500">{t.actual_percentage}% · {t.time_spent_hours}h</span>
                    </div>
                  ))}
                </div>
                {v.tasks_planned && <div><h4 className="font-semibold text-slate-700 mb-1">Planned Next Week</h4><p className="text-slate-600 whitespace-pre-wrap text-xs bg-slate-50 p-2.5 rounded">{v.tasks_planned}</p></div>}
                {v.blockers?.length > 0 && <div><h4 className="font-semibold text-slate-700 mb-1">Blockers</h4>{v.blockers.map((b, i) => (<p key={i} className="text-xs text-amber-800 bg-amber-50 p-2 rounded mb-1">{b.is_key_issue && '⚠️ [KEY] '}{b.description}</p>))}</div>}
                {comments.length > 0 && (
                  <div className="border-t pt-3">
                    <h4 className="font-semibold text-slate-700 mb-2">Comments on v{v.version_number}:</h4>
                    {comments.map((c) => (
                      <div key={c.id} className="text-xs p-2.5 rounded bg-slate-100 mb-1.5 flex items-start gap-2">
                        {c.action === 'approved' ? <CheckCircle size={14} className="text-emerald-600 mt-0.5" /> : <AlertCircle size={14} className="text-amber-600 mt-0.5" />}
                        <div><p className="font-medium">{c.reviewer_name || 'Manager'}:</p><p className="text-slate-600 mt-0.5">{c.comment}</p></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}