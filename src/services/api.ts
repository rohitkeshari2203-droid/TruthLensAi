import axios, { AxiosError } from 'axios';
import { Analysis, Source, Report, AuditLog, User, InputType } from '../types';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('truthlens_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    const errorData = error.response?.data?.error;
    const message = errorData?.message || error.message || 'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  async register(data: { name: string; email: string; password: string; preferred_language?: string }) {
    const res = await api.post('/auth/register', data);
    return res.data.data;
  },
  async login(data: { email: string; password: string }) {
    const res = await api.post('/auth/login', data);
    return res.data.data;
  },
  async logout() {
    const res = await api.post('/auth/logout');
    return res.data;
  },
  async getCurrentUser() {
    const res = await api.get('/auth/me');
    return res.data.data.user as User;
  },
};

export const analyzeApi = {
  async analyzeText(text: string, inputType: InputType = 'TEXT') {
    const res = await api.post('/analyze/text', { text, inputType });
    return res.data.data.analysis as Analysis;
  },
  async analyzeUrl(url: string) {
    const res = await api.post('/analyze/url', { url });
    return res.data.data as { analysis: Analysis; articleMeta: any };
  },
  async parseOcr(imageBase64: string, mimeType: string = 'image/png') {
    const res = await api.post('/analyze/ocr', { imageBase64, mimeType });
    return res.data.data as {
      extracted_text: string;
      headline?: string;
      source_detected?: string;
      date_detected?: string;
      confidence: number;
    };
  },
  async analyzeImage(imageBase64: string, mimeType: string = 'image/png', editedText?: string) {
    const res = await api.post('/analyze/image', { imageBase64, mimeType, editedText });
    return res.data.data.analysis as Analysis;
  },
  async getAnalyses(params?: { verdict?: string; language?: string; search?: string; userOnly?: boolean }) {
    const res = await api.get('/analyses', { params });
    return res.data.data as { total: number; analyses: Analysis[] };
  },
  async getAnalysisById(id: string) {
    const res = await api.get(`/analyses/${id}`);
    return res.data.data as { analysis: Analysis; isSaved: boolean };
  },
  async deleteAnalysis(id: string) {
    const res = await api.delete(`/analyses/${id}`);
    return res.data;
  },
  async saveAnalysis(id: string) {
    const res = await api.post(`/analyses/${id}/save`);
    return res.data.data as { isSaved: boolean };
  },
  async removeSavedAnalysis(id: string) {
    const res = await api.delete(`/analyses/${id}/save`);
    return res.data.data as { isSaved: boolean };
  },
  async getSavedAnalyses() {
    const res = await api.get('/saved');
    return res.data.data.analyses as Analysis[];
  },
  async reportAnalysis(id: string, reason: string, details?: string) {
    const res = await api.post(`/analyses/${id}/report`, { reason, details });
    return res.data.data;
  },
  async getSources() {
    const res = await api.get('/sources');
    return res.data.data.sources as Source[];
  },
  async getSourceByDomain(domain: string) {
    const res = await api.get(`/sources/${domain}`);
    return res.data.data.source as Source;
  },
};

export const adminApi = {
  async getStats() {
    const res = await api.get('/admin/stats');
    return res.data.data.stats;
  },
  async getUsers() {
    const res = await api.get('/admin/users');
    return res.data.data.users as User[];
  },
  async updateUser(id: string, updates: { role?: 'USER' | 'ADMIN'; is_active?: boolean }) {
    const res = await api.put(`/admin/users/${id}`, updates);
    return res.data.data.user as User;
  },
  async getReports() {
    const res = await api.get('/admin/reports');
    return res.data.data.reports as Report[];
  },
  async updateReportStatus(id: string, status: 'PENDING' | 'REVIEWED' | 'DISMISSED') {
    const res = await api.put(`/admin/reports/${id}/status`, { status });
    return res.data.data.report as Report;
  },
  async upsertSource(source: Partial<Source>) {
    const res = await api.post('/admin/sources', source);
    return res.data.data.source as Source;
  },
  async getAuditLogs() {
    const res = await api.get('/admin/audit-logs');
    return res.data.data.logs as AuditLog[];
  },
};
