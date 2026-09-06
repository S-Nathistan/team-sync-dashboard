import React, { useEffect, useState } from 'react';
import { getTeamReports } from '../../api/reports';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function SectionComparison() {
  const [reports, setReports] = useState([]);
  const [section, setSection] = useState('blockers');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeamReports({ limit: 50 })
      .then((res) => setReports(res.data.reports))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Side-by-Side Section Comparison</h2>
          <p className="text-sm text-slate-500">Inspect Blockers or Achievements across all members simultaneously.</p>
        </div>
        <Select
          className="w-48"
          options={[
            { value: 'blockers', label: 'Blockers / Challenges' },
            { value: 'achievements', label: 'Achievements / Highlights' },
          ]}
          value={section}
          onChange={(e) => setSection(e.target.value)}
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((r) => {
            const v = r.latest_version;
            const items = section === 'blockers' ? v?.blockers : v?.achievements;

            return (
              <Card key={r.id} className="p-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">{r.user_name}</h4>
                  <p className="text-xs text-slate-400 mb-3">{r.project_name || 'General'}</p>

                  <div className="space-y-1.5">
                    {!items || items.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">None reported.</p>
                    ) : (
                      items.map((it, idx) => (
                        <p
                          key={idx}
                          className={`text-xs p-2 rounded ${
                            section === 'blockers'
                              ? 'bg-rose-50 text-rose-900'
                              : 'bg-emerald-50 text-emerald-900'
                          }`}
                        >
                          {(it.is_key_issue || it.is_key_achievement) && (
                            <span className="font-bold">★ [KEY] </span>
                          )}
                          {it.description}
                        </p>
                      ))
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}