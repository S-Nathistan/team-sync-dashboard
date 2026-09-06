import api from './axios';

export const createReport = (data) => api.post('/reports', data);
export const getMyReports = (params) => api.get('/reports/my', { params });
export const getTeamReports = (params) => api.get('/reports/team', { params });
export const getReport = (id) => api.get(`/reports/${id}`);
export const updateReport = (id, data) => api.put(`/reports/${id}`, data);
export const submitReport = (id) => api.post(`/reports/${id}/submit`);
export const getReportVersions = (id) => api.get(`/reports/${id}/versions`);
export const approveReport = (id, data) => api.post(`/reports/${id}/approve`, data);
export const requestChanges = (id, data) => api.post(`/reports/${id}/request-changes`, data);