import api from './axios';

export const getDashboardSummary = () => api.get('/dashboard/summary');
export const getDashboardCharts = () => api.get('/dashboard/charts');
export const getTasksTrend = (weeks) => api.get('/dashboard/charts/tasks-trend', { params: { weeks } });
export const getSubmissionStatus = (weekStart) =>
  api.get('/dashboard/charts/submission-status', { params: { week_start: weekStart } });
export const getWorkload = () => api.get('/dashboard/charts/workload');
export const getTimeDistribution = () => api.get('/dashboard/charts/time-distribution');
export const getActivityFeed = (limit) => api.get('/dashboard/activity-feed', { params: { limit } });