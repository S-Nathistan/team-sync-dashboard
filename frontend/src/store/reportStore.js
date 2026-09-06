import { create } from 'zustand';

export const useReportStore = create((set) => ({
  currentReport: null,
  reports: [],
  totalReports: 0,
  loading: false,

  setCurrentReport: (report) => set({ currentReport: report }),
  setReports: (reports, total) => set({ reports, totalReports: total }),
  setLoading: (loading) => set({ loading }),
  clearCurrentReport: () => set({ currentReport: null }),
}));