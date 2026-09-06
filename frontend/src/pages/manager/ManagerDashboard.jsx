import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardSummary, getDashboardCharts } from '../../api/dashboard';
import { getTeamReports } from '../../api/reports';
import SummaryCards from '../../components/dashboard/SummaryCards';
import TasksTrendChart from '../../components/dashboard/TasksTrendChart';
import SubmissionStatusChart from '../../components/dashboard/SubmissionStatusChart';
import WorkloadChart from '../../components/dashboard/WorkloadChart';
import TimeDistributionChart from '../../components/dashboard/TimeDistributionChart';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import AIChatWidget from '../../components/chat/AIChatWidget';
import Table from '../../components/common/Table';
import Card from '../../components/common/Card';
import ReportStatusBadge from '../../components/reports/ReportStatusBadge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatWeekRange, formatDate } from '../../utils/formatters';
import { Inbox } from 'lucide-react';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [pendingReports, setPendingReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardSummary(),
      getDashboardCharts(),
      getTeamReports({ status: 'submitted', limit: 5 }),
    ])
      .then(([sRes, cRes, pRes]) => {
        setSummary(sRes.data);
        setCharts(cRes.data);
        setPendingReports(pRes.data.reports || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const columns = [
    { key: 'user_name', label: 'Team Member' },
    { key: 'week', label: 'Week Range', render: (_, r) => formatWeekRange(r.week_start, r.week_end) },
    { key: 'project_name', label: 'Project', render: (v) => v || 'General' },
    { key: 'status', label: 'Status', render: (v) => <ReportStatusBadge status={v} /> },
    { key: 'submitted_at', label: 'Submitted On', render: (v) => formatDate(v) || '—' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Team Dashboard & Analytics</h2>
          <p className="text-sm text-slate-500">Consolidated weekly metrics, live action feed, and reports review.</p>
        </div>
        <Button onClick={() => navigate('/manager/reports')}>
          View All Team Reports →
        </Button>
      </div>

      <SummaryCards summary={summary} />

      {/* Actionable Pending Reviews Section */}
      {pendingReports.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Inbox size={18} className="text-primary-600" />
              Reports Awaiting Manager Review
            </h3>
            <span className="text-xs text-slate-400">Click any row to open the review screen</span>
          </div>
          <Card className="p-0 overflow-hidden shadow-sm">
            <Table
              columns={columns}
              data={pendingReports}
              onRowClick={(r) => navigate(`/manager/reports/${r.id}`)}
            />
          </Card>
        </div>
      )}

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TasksTrendChart data={charts?.tasks_trend} />
        <SubmissionStatusChart data={charts?.submission_status} />
        <WorkloadChart data={charts?.workload} />
        <TimeDistributionChart data={charts?.time_distribution} />
      </div>

      <ActivityFeed items={charts?.activity_feed} />
      <AIChatWidget />
    </div>
  );
}