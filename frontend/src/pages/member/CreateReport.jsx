import React from 'react';
import ReportForm from '../../components/reports/ReportForm';

export default function CreateReport() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">New Weekly Report</h2>
        <p className="text-sm text-slate-500">Fill in your work details following the standardized team format.</p>
      </div>
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <ReportForm mode="create" />
      </div>
    </div>
  );
}