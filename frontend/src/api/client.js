import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

export const getDashboardSummary = () => api.get('/dashboard/summary').then((r) => r.data);

export const getMapLayers = (params = {}) => api.get('/map/layers', { params }).then((r) => r.data);

export const getDemandPoints = (params = {}) => api.get('/map/demand', { params }).then((r) => r.data);

export const getScenarios = () => api.get('/scenarios').then((r) => r.data);

export const createScenario = (payload) => api.post('/scenarios', payload).then((r) => r.data);

export const getScenario = (id) => api.get(`/scenarios/${id}`).then((r) => r.data);

export const deleteScenario = (id) => api.delete(`/scenarios/${id}`).then((r) => r.data);

export const compareScenarios = (ids) =>
  api.get('/scenarios/compare', { params: { ids: ids.join(',') } }).then((r) => r.data);

export const uploadOptimizationResults = (scenarioId, file) => {
  const form = new FormData();
  form.append('scenario_id', scenarioId);
  form.append('file', file);
  return api.post('/import/optimization-results', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
};

export const uploadSimulationResults = (scenarioId, file) => {
  const form = new FormData();
  form.append('scenario_id', scenarioId);
  form.append('file', file);
  return api.post('/import/simulation-results', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
};

export default api;
