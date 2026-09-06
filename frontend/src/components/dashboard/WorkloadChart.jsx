import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import Card from '../common/Card';

export default function WorkloadChart({ data = [] }) {
  return (
    <Card className="h-80 flex flex-col">
      <h3 className="text-sm font-semibold text-slate-800 mb-2">Workload by Project (Hours)</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis dataKey="project_name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} width={100} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            <Bar dataKey="total_hours" fill="#6366f1" radius={[0, 4, 4, 0]} name="Hours" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}