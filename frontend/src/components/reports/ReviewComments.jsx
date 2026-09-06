import React from 'react';
import { MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export default function ReviewComments({ comments = [] }) {
  if (!comments || comments.length === 0) return null;
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
        <MessageSquare size={18} className="text-primary-600" /> Manager Review History
      </h3>
      <div className="space-y-3">
        {comments.map((c) => {
          const isApproval = c.action === 'approved';
          return (
            <div key={c.id} className={`p-4 rounded-xl border ${isApproval ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  {isApproval ? <CheckCircle size={16} className="text-emerald-600" /> : <AlertCircle size={16} className="text-amber-600" />}
                  <span>{c.reviewer_name || 'Manager'}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/60 font-medium">Version {c.version_number}</span>
                </div>
                <span className="text-xs text-slate-500">{formatDateTime(c.created_at)}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{c.comment || '(No comment)'}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}