import React, { useEffect, useState } from 'react';
import { getMyReports } from '../../api/reports';
import Table from '../../components/common/Table';
import ReportStatusBadge from '../../components/reports/ReportStatusBadge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatWeekRange, formatDate } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';

export default function ReportHistory() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getMyReports({ page, limit: 10 })
      .then((res) => {
        setReports(res.data.reports);
        setTotal(res.data.total);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const columns = [
    {
      key: 'week',
      label: 'Week Range',
      render: (_, r) => formatWeekRange(r.week_start, r.week_end),
    },
    { key: 'project_name', label: 'Project', render: (val) => val || '—' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <ReportStatusBadge status={val} />,
    },
    { key: 'current_version', label: 'Version', render: (val) => `v${val}` },
    { key: 'updated_at', label: 'Last Updated', render: (val) => formatDate(val) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Report History</h2>
        <p className="text-sm text-slate-500">View and track all your submitted and drafted weekly reports.</p>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <Table
              columns={columns}
              data={reports}
              onRowClick={(r) => navigate(`/reports/${r.id}`)}
            />
            <div className="p-4">
              <Pagination
                page={page}
                totalPages={Math.ceil(total / 10)}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}