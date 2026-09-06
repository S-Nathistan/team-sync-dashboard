import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser } from '../../api/users';
import { getTeamReports } from '../../api/reports';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import ReportStatusBadge from '../../components/reports/ReportStatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatWeekRange, capitalize } from '../../utils/formatters';
import { Mail, Shield, User } from 'lucide-react';

export default function MemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUser(id), getTeamReports({ user_id: Number(id), limit: 20 })])
      .then(([uRes, rRes]) => {
        setMember(uRes.data);
        setReports(rRes.data.reports);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !member) return <LoadingSpinner />;

  const columns = [
    { key: 'week', label: 'Week Range', render: (_, r) => formatWeekRange(r.week_start, r.week_end) },
    { key: 'project_name', label: 'Project', render: (v) => v || '—' },
    { key: 'status', label: 'Status', render: (v) => <ReportStatusBadge status={v} /> },
    { key: 'current_version', label: 'Version', render: (v) => `v${v}` },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 font-bold text-2xl flex items-center justify-center">
            {member.full_name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{member.full_name}</h2>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1"><User size={14} /> @{member.username}</span>
              <span className="flex items-center gap-1"><Mail size={14} /> {member.email}</span>
              <span className="flex items-center gap-1"><Shield size={14} /> {capitalize(member.role)}</span>
            </div>
          </div>
        </div>
      </Card>

      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Report History</h3>
        <Card className="p-0 overflow-hidden">
          <Table
            columns={columns}
            data={reports}
            onRowClick={(r) => navigate(`/manager/reports/${r.id}`)}
          />
        </Card>
      </div>
    </div>
  );
}