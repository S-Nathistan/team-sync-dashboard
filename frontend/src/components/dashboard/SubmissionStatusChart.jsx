import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Card from '../common/Card';

export default function SubmissionStatusChart({ data = [] }) {
  return (
    <Card className="h-80 flex flex-col">
      <h3 className="text-sm font-semibold text-slate-800 mb-2">Submission Status by Member</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="user_name" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="approved" stackId="a" fill="#10b981" name="Approved" />
            <Bar dataKey="submitted" stackId="a" fill="#3b82f6" name="Submitted" />
            <Bar dataKey="needs_correction" stackId="a" fill="#f59e0b" name="Needs Correction" />
            <Bar dataKey="draft" stackId="a" fill="#94a3b8" name="Draft" />
            <Bar dataKey="not_started" stackId="a" fill="#e2e8f0" name="Not Started" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}