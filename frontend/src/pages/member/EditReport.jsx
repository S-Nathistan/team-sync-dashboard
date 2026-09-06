import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReport } from '../../api/reports';
import ReportForm from '../../components/reports/ReportForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ReviewComments from '../../components/reports/ReviewComments';
import toast from 'react-hot-toast';

export default function EditReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReport(id)
      .then((res) => {
        if (res.data.status !== 'draft' && res.data.status !== 'needs_correction') {
          toast.error('This report is locked and cannot be edited.');
          navigate(`/reports/${id}`);
          return;
        }
        setReport(res.data);
      })
      .catch(() => {
        toast.error('Failed to load report');
        navigate('/reports');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Edit Weekly Report</h2>
        <p className="text-sm text-slate-500">Update your tasks and address any manager feedback.</p>
      </div>

      {report?.review_comments?.length > 0 && (
        <ReviewComments comments={report.review_comments} />
      )}

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <ReportForm existingReport={report} mode="edit" />
      </div>
    </div>
  );
}