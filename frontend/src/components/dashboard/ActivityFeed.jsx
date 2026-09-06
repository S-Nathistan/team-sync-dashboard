import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUp, CheckCircle, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import Card from '../common/Card';
import { formatDateTime } from '../../utils/formatters';

export default function ActivityFeed({ items = [] }) {
  const navigate = useNavigate();

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Clock size={16} className="text-primary-600" /> 
        Recent Activity Feed (Click any item to inspect)
      </h3>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400">No activity recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((it, idx) => {
            let Icon = FileUp;
            let iconColor = 'text-blue-500 bg-blue-50';

            if (it.action === 'approved') {
              Icon = CheckCircle;
              iconColor = 'text-emerald-500 bg-emerald-50';
            } else if (it.action === 'needs_correction') {
              Icon = AlertCircle;
              iconColor = 'text-amber-500 bg-amber-50';
            }

            return (
              <div 
                key={idx}
                onClick={() => it.report_id && navigate(`/manager/reports/${it.report_id}`)}
                className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${iconColor}`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-800">
                      <span className="font-semibold">{it.user_name}</span> {it.detail}
                    </p>
                    <p className="text-[10px] text-slate-400">{formatDateTime(it.timestamp)}</p>
                  </div>
                </div>
                <span className="text-xs text-primary-600 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                  Inspect <ArrowRight size={12} />
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}