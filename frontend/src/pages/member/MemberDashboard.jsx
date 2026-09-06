import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, FileText, CheckCircle2, Clock } from 'lucide-react';
import { getMyReports } from '../../api/reports';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ReportCard from '../../components/reports/ReportCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function MemberDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyReports({ limit: 4 })
      .then((res) => setReports(res.data.reports))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome back, {user?.full_name}! 👋</h2>
          <p className="text-sm text-slate-500">Track and submit your weekly contributions.</p>
        </div>
        <Button onClick={() => navigate('/reports/new')} className="w-full sm:w-auto">
          <PlusCircle size={18} /> Create Weekly Report
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><FileText size={22} /></div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Submitted</p>
            <h4 className="text-xl font-bold text-slate-800">{reports.length} Reports</h4>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 size={22} /></div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Approved</p>
            <h4 className="text-xl font-bold text-slate-800">
              {reports.filter((r) => r.status === 'approved').length}
            </h4>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock size={22} /></div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Needs Attention</p>
            <h4 className="text-xl font-bold text-slate-800">
              {reports.filter((r) => r.status === 'needs_correction').length}
            </h4>
          </div>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Recent Reports</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
            View All History →
          </Button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : reports.length === 0 ? (
          <Card className="p-8 text-center text-slate-400">
            You haven’t submitted any reports yet. Click "Create Weekly Report" to start!
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((r) => (
              <ReportCard key={r.id} report={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}