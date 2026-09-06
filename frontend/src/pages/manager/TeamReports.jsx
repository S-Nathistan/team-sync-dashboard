import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getTeamReports } from '../../api/reports';
import { getProjects } from '../../api/projects';
import { getUsers } from '../../api/users';
import Table from '../../components/common/Table';
import ReportStatusBadge from '../../components/reports/ReportStatusBadge';
import Pagination from '../../components/common/Pagination';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatWeekRange, formatDate, getCurrentWeekRange } from '../../utils/formatters';
import { RotateCcw } from 'lucide-react';

export default function TeamReports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlStatus = searchParams.get('status') || '';
  const urlWeek = searchParams.get('week_start') || '';
  const urlUser = searchParams.get('user_id') || '';

  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Filters
  const [status, setStatus] = useState(urlStatus);
  const [projectId, setProjectId] = useState('');
  const [userId, setUserId] = useState(urlUser);
  const [weekStart, setWeekStart] = useState(urlWeek);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const currentWeek = getCurrentWeekRange().start;

  // Sync state if URL changes
  useEffect(() => {
    setStatus(searchParams.get('status') || '');
    setWeekStart(searchParams.get('week_start') || '');
    setUserId(searchParams.get('user_id') || '');
  }, [searchParams]);

  // Load project & user lists for dropdown filters
  useEffect(() => {
    Promise.all([getProjects(), getUsers({ limit: 100 })])
      .then(([pRes, uRes]) => {
        setProjects(pRes.data.projects || []);
        setUsers(uRes.data.users?.filter((u) => u.role === 'team_member') || []);
      })
      .catch(() => {});
  }, []);

  // Fetch reports with active filters
  useEffect(() => {
    setLoading(true);
    getTeamReports({
      page,
      limit: 10,
      status: status || undefined,
      project_id: projectId ? Number(projectId) : undefined,
      user_id: userId ? Number(userId) : undefined,
      week_start: weekStart || undefined,
    })
      .then((res) => {
        setReports(res.data.reports || []);
        setTotal(res.data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [page, status, projectId, userId, weekStart]);

  const resetFilters = () => {
    setStatus('');
    setProjectId('');
    setUserId('');
    setWeekStart('');
    setSearchParams({});
  };

  const columns = [
    { key: 'user_name', label: 'Member' },
    { key: 'week', label: 'Week Range', render: (_, r) => formatWeekRange(r.week_start, r.week_end) },
    { key: 'project_name', label: 'Project', render: (v) => v || 'General' },
    { key: 'status', label: 'Status', render: (v) => <ReportStatusBadge status={v} /> },
    { key: 'current_version', label: 'Version', render: (v) => `v${v}` },
    { key: 'submitted_at', label: 'Submitted On', render: (v) => formatDate(v) || '—' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">All Team Reports</h2>
          <p className="text-sm text-slate-500">Filter, inspect, and review all submissions across the team.</p>
        </div>
        {(status || projectId || userId || weekStart) && (
          <Button variant="outline" size="sm" onClick={resetFilters} className="text-xs flex items-center gap-1">
            <RotateCcw size={14} /> Clear All Filters
          </Button>
        )}
      </div>

      {/* 4-Way Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <Select
          label="Week Range"
          options={[
            { value: '', label: 'All Weeks' },
            { value: currentWeek, label: `This Week (${currentWeek})` },
          ]}
          value={weekStart}
          onChange={(e) => setWeekStart(e.target.value)}
        />

        <Select
          label="Status"
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'submitted', label: 'Submitted (Needs Review)' },
            { value: 'needs_correction', label: 'Needs Correction' },
            { value: 'approved', label: 'Approved' },
          ]}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />

        <Select
          label="Team Member"
          options={[
            { value: '', label: 'All Members' },
            ...users.map((u) => ({ value: String(u.id), label: u.full_name })),
          ]}
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />

        <Select
          label="Project"
          options={[
            { value: '', label: 'All Projects' },
            ...projects.map((p) => ({ value: String(p.id), label: p.name })),
          ]}
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        />
      </div>

      <Card className="p-0 overflow-hidden shadow-sm">
        {loading ? (
          <LoadingSpinner />
        ) : reports.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No reports found matching your selected filters.
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={reports}
              onRowClick={(r) => navigate(`/manager/reports/${r.id}`)}
            />
            <div className="p-4 border-t border-slate-100">
              <Pagination
                page={page}
                totalPages={Math.ceil(total / 10) || 1}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}