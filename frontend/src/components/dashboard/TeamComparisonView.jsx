import React from 'react';
import Card from '../common/Card';

export default function TeamComparisonView({ reports = [], section = 'blockers' }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reports.map((r) => {
        const v = r.latest_version;
        const items = section === 'blockers' ? v?.blockers : v?.achievements;
        return (
          <Card key={r.id} className="p-4">
            <h4 className="font-semibold text-slate-800 text-sm">{r.user_name}</h4>
            <p className="text-xs text-slate-400 mb-3">{r.project_name || 'General'}</p>
            <div className="space-y-1.5">
              {!items || items.length === 0 ? (
                <p className="text-xs text-slate-400 italic">None reported.</p>
              ) : (
                items.map((it, idx) => (
                  <p key={idx} className={`text-xs p-2 rounded ${section === 'blockers' ? 'bg-rose-50 text-rose-900' : 'bg-emerald-50 text-emerald-900'}`}>
                    {(it.is_key_issue || it.is_key_achievement) && <span className="font-bold">★ [KEY] </span>}
                    {it.description}
                  </p>
                ))
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}