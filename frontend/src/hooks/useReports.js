import { useState, useCallback } from 'react';
import { getMyReports, getTeamReports, getReport } from '../api/reports';
import toast from 'react-hot-toast';

export function useReports() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchMyReports = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await getMyReports(params);
      setReports(data.reports);
      setTotal(data.total);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeamReports = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await getTeamReports(params);
      setReports(data.reports);
      setTotal(data.total);
    } catch (err) {
      toast.error('Failed to load team reports');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReport = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data } = await getReport(id);
      return data;
    } catch (err) {
      toast.error('Failed to load report');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { reports, total, loading, fetchMyReports, fetchTeamReports, fetchReport };
}