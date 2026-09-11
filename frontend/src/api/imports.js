import api from './client.js';

const uploadFile = (endpoint, file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post(endpoint, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
};

export const uploadCandidatePois = (file) => uploadFile('/import/candidate-pois', file);
export const uploadExistingChargers = (file) => uploadFile('/import/existing-chargers', file);
export const uploadSockets = (file) => uploadFile('/import/sockets', file);
export const uploadTrafficDemand = (file) => uploadFile('/import/traffic-demand', file);
export const getImportHistory = () => api.get('/imports').then((r) => r.data);
export const clearDataset = (type) => api.delete(`/import/${type}`).then((r) => r.data);