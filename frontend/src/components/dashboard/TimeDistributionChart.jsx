import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import Card from '../common/Card';
import { capitalize } from '../../utils/formatters';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export default function TimeDistributionChart({ data = [] }) {
  const formattedData = data.map((d) => ({
    name: capitalize(d.task_type),
    value: d.total_hours,
  }));

  return (
    <Card className="h-80 flex flex-col">
      <h3 className="text-sm font-semibold text-slate-800 mb-2">Time Spent by Task Type</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={formattedData} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
              {formattedData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}